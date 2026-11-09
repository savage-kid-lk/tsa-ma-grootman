-- Editable store copy (size guide, returns policy), managed from /admin/content.
create table public.site_content (
  key         text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;
create policy "site_content: public read" on public.site_content for select to anon, authenticated using (true);
create policy "site_content: admin insert" on public.site_content for insert to authenticated with check ((select private.is_admin()));
create policy "site_content: admin update" on public.site_content for update to authenticated using ((select private.is_admin()));

insert into public.site_content (key, data) values
('size_guide', jsonb_build_object(
  'intro', 'Our tees have a relaxed, structured fit. Measurements are chest width (armpit to armpit) and body length, in centimetres.',
  'rows', jsonb_build_array(
    jsonb_build_object('size', 'S',   'chest', '51', 'length', '70'),
    jsonb_build_object('size', 'M',   'chest', '54', 'length', '72'),
    jsonb_build_object('size', 'L',   'chest', '57', 'length', '74'),
    jsonb_build_object('size', 'XL',  'chest', '60', 'length', '76'),
    jsonb_build_object('size', '2XL', 'chest', '63', 'length', '78'),
    jsonb_build_object('size', '3XL', 'chest', '66', 'length', '80')))),
('returns', jsonb_build_object(
  'body', 'Unworn, unwashed items can be exchanged or returned within 14 days of delivery. Contact us with your order number and we''ll arrange it. Sizing exchanges are on us.'));
