-- =========================================================
-- Tsa Ma Grootman — e-commerce schema
-- profiles · products · product_colors · product_images · orders · order_items
-- =========================================================

-- ---------- profiles (one per auth user) ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- catalogue ----------
create table public.products (
  id           text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),  -- url slug
  name         text not null,
  collection   text not null default 'logo',
  price        numeric(10, 2) not null check (price > 0),
  badge        text,
  short        text,
  description  text,
  sizes        text[] not null default array['S', 'M', 'L', 'XL', '2XL', '3XL'],
  active       boolean not null default true,
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products (id) on delete cascade,
  name        text not null,
  hex         text not null default '#111111',
  position    integer not null default 0
);
create index on public.product_colors (product_id);

-- color_id null = image shown for every colour
create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references public.products (id) on delete cascade,
  color_id      uuid references public.product_colors (id) on delete set null,
  url           text not null,
  storage_path  text,             -- set when the file lives in the product-images bucket
  alt           text,
  position      integer not null default 0
);
create index on public.product_images (product_id);
create index on public.product_images (color_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- orders ----------
create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  number        text not null unique,
  user_id       uuid not null references auth.users (id) on delete restrict,
  email         text not null,
  full_name     text not null,
  phone         text,
  address       jsonb not null,
  subtotal      numeric(10, 2) not null,
  shipping      numeric(10, 2) not null default 0,
  total         numeric(10, 2) not null,
  status        text not null default 'pending'
                check (status in ('pending', 'paid', 'failed', 'cancelled', 'processing', 'shipped', 'delivered')),
  pf_payment_id text,
  payment_data  jsonb,
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.orders (user_id);
create index on public.orders (status);
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  product_id  text references public.products (id) on delete set null,
  name        text not null,
  color       text,
  size        text,
  qty         integer not null check (qty between 1 and 20),
  unit_price  numeric(10, 2) not null,
  image       text
);
create index on public.order_items (order_id);
create index on public.order_items (product_id);

-- =========================================================
-- Row level security
-- =========================================================
alter table public.profiles       enable row level security;
alter table public.products       enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_images enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- profiles: read/update self (name + phone only), admins read all
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- catalogue: everyone reads active products, admins manage everything
create policy "products: public read active" on public.products
  for select to anon, authenticated using (active or (select public.is_admin()));
create policy "products: admin insert" on public.products for insert to authenticated with check ((select public.is_admin()));
create policy "products: admin update" on public.products for update to authenticated using ((select public.is_admin()));
create policy "products: admin delete" on public.products for delete to authenticated using ((select public.is_admin()));

create policy "colors: public read" on public.product_colors for select to anon, authenticated using (true);
create policy "colors: admin insert" on public.product_colors for insert to authenticated with check ((select public.is_admin()));
create policy "colors: admin update" on public.product_colors for update to authenticated using ((select public.is_admin()));
create policy "colors: admin delete" on public.product_colors for delete to authenticated using ((select public.is_admin()));

create policy "images: public read" on public.product_images for select to anon, authenticated using (true);
create policy "images: admin insert" on public.product_images for insert to authenticated with check ((select public.is_admin()));
create policy "images: admin update" on public.product_images for update to authenticated using ((select public.is_admin()));
create policy "images: admin delete" on public.product_images for delete to authenticated using ((select public.is_admin()));

-- orders: created only by the create-payment edge function (service role).
-- Customers read their own; admins read all and update status.
create policy "orders: read own or admin" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orders: admin update" on public.orders
  for update to authenticated using ((select public.is_admin()));
revoke update on public.orders from authenticated, anon;
grant update (status) on public.orders to authenticated;

create policy "order_items: read own or admin" on public.order_items
  for select to authenticated using (
    (select public.is_admin())
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

-- =========================================================
-- Storage: public bucket for product photos, admin-only writes
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product-images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product-images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product-images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
