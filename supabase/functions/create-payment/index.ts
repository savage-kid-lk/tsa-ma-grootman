// POST { items: [{ productId, color, size, qty }], customer: { name, phone, email, address, suburb, city, province, postal } }
// Requires a signed-in user. Re-prices the cart from the database, creates a pending order and returns
// the signed PayFast form fields for the browser to post.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PAYFAST, cors, pfHost, serviceKey, signature } from '../_shared/payfast.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];
const SHIPPING = 0; // free nationwide delivery

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, serviceKey(), { auth: { persistSession: false } });

  // --- who is paying ---
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: 'Please sign in to check out.' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const items = Array.isArray(body?.items) ? body.items : [];
  const c = body?.customer ?? {};
  const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const customer = {
    name: str(c.name, 100), phone: str(c.phone, 30), email: str(c.email, 120) || user.email || '',
    address: str(c.address), suburb: str(c.suburb, 100), city: str(c.city, 100), province: str(c.province, 40), postal: str(c.postal, 10),
  };
  if (!items.length || items.length > 50) return json({ error: 'Your cart is empty.' }, 400);
  if (!customer.name || !customer.email || !customer.address || !customer.city || !PROVINCES.includes(customer.province) || !/^\d{4}$/.test(customer.postal)) {
    return json({ error: 'Please complete your delivery details.' }, 400);
  }

  // --- price the cart from the database (never trust client prices) ---
  const ids = [...new Set(items.map((i: any) => String(i.productId)))];
  const { data: products, error: pErr } = await admin
    .from('products')
    .select('id, name, price, sizes, active, unlimited_stock, stock_quantity, product_colors(id, name), product_images(url, color_id, position)')
    .in('id', ids);
  if (pErr) return json({ error: 'Could not load products.' }, 500);

  const lines = [];
  for (const i of items) {
    const p = products?.find((x) => x.id === String(i.productId));
    const qty = Math.floor(Number(i.qty));
    if (!p || !p.active) return json({ error: 'An item in your cart is no longer available.' }, 409);
    const color = p.product_colors.find((x: any) => x.name === i.color);
    if (!color) return json({ error: `${p.name}: that colour is no longer available.` }, 409);
    if (!p.sizes.includes(i.size)) return json({ error: `${p.name}: size ${i.size} is no longer available.` }, 409);
    if (!(qty >= 1 && qty <= 20)) return json({ error: 'Invalid quantity.' }, 400);
    const imgs = [...p.product_images].sort((a: any, b: any) => a.position - b.position);
    const image = (imgs.find((m: any) => m.color_id === color.id) ?? imgs[0])?.url ?? null;
    lines.push({ product_id: p.id, name: p.name, color: color.name, size: i.size, qty, unit_price: Number(p.price), image });
  }
  // --- stock: total quantity per product must fit what's on the shelf ---
  const wanted = new Map<string, number>();
  for (const l of lines) wanted.set(l.product_id, (wanted.get(l.product_id) ?? 0) + l.qty);
  for (const [pid, qty] of wanted) {
    const p = products!.find((x) => x.id === pid)!;
    if (p.unlimited_stock) continue;
    if (p.stock_quantity <= 0) return json({ error: `${p.name} has just sold out. Please remove it from your cart.` }, 409);
    if (qty > p.stock_quantity) return json({ error: `Only ${p.stock_quantity} of ${p.name} left — please lower the quantity in your cart.` }, 409);
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.unit_price * l.qty, 0) * 100) / 100;
  const total = subtotal + SHIPPING;

  // --- create the pending order ---
  const number = 'TMG-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 36).toString(36).toUpperCase();
  const { data: order, error: oErr } = await admin
    .from('orders')
    .insert({
      number, user_id: user.id, email: customer.email, full_name: customer.name, phone: customer.phone,
      address: { address: customer.address, suburb: customer.suburb, city: customer.city, province: customer.province, postal: customer.postal },
      subtotal, shipping: SHIPPING, total, status: 'pending',
    })
    .select('id, number')
    .single();
  if (oErr) return json({ error: 'Could not create your order.' }, 500);

  const { error: iErr } = await admin.from('order_items').insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (iErr) {
    await admin.from('orders').delete().eq('id', order.id);
    return json({ error: 'Could not create your order.' }, 500);
  }

  // --- signed PayFast fields (order matters for the signature) ---
  const origin = req.headers.get('origin') ?? Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
  const [first, ...rest] = customer.name.split(/\s+/);
  const cell = customer.phone.replace(/\D/g, '').replace(/^27/, '0');
  const pairs: [string, string][] = [
    ['merchant_id', PAYFAST.merchantId],
    ['merchant_key', PAYFAST.merchantKey],
    ['return_url', `${origin}/checkout/result?order=${order.id}`],
    ['cancel_url', `${origin}/checkout/result?order=${order.id}&cancelled=1`],
    ['notify_url', `${url}/functions/v1/payfast-itn`],
    ['name_first', first ?? ''],
    ['name_last', rest.join(' ')],
    ['email_address', customer.email],
    ['cell_number', /^0\d{9}$/.test(cell) ? cell : ''],
    ['m_payment_id', order.id],
    ['amount', total.toFixed(2)],
    ['item_name', `Tsa Ma Grootman order ${order.number}`],
  ];
  const fields = Object.fromEntries(pairs.filter(([, v]) => v.trim() !== ''));
  // PayFast only requires a signature when the merchant has a passphrase (the public sandbox merchant doesn't)
  if (PAYFAST.passphrase) fields.signature = await signature(pairs, true);

  return json({ order, action: `${pfHost()}/eng/process`, fields });
});
