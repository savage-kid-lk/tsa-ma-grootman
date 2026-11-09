-- Inventory: per-product stock with an "unlimited" switch and a low-stock alert level.
-- Existing products start as unlimited so nothing becomes unbuyable until the admin sets a quantity.
alter table public.products
  add column unlimited_stock     boolean not null default true,
  add column stock_quantity      integer not null default 0 check (stock_quantity >= 0),
  add column low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0);

-- Called by the payfast-itn function (service role) once an order is confirmed paid.
-- Subtracts the ordered quantities from every product that tracks stock.
create or replace function public.apply_order_stock(p_order uuid)
returns void language sql security definer set search_path = '' as $$
  update public.products p
     set stock_quantity = greatest(p.stock_quantity - s.qty, 0)
    from (
      select product_id, sum(qty)::int as qty
        from public.order_items
       where order_id = p_order and product_id is not null
       group by product_id
    ) s
   where p.id = s.product_id
     and not p.unlimited_stock;
$$;
revoke execute on function public.apply_order_stock(uuid) from public, anon, authenticated;
grant execute on function public.apply_order_stock(uuid) to service_role;
