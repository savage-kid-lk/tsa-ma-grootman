// PayFast Instant Transaction Notification (ITN) endpoint. Deployed with verify_jwt = false.
// Checks: 1) signature  2) PayFast server validation  3) amount matches the order. Then updates the order.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { paramString, pfHost, serviceKey, signature } from '../_shared/payfast.ts';

const ok = () => new Response('OK', { status: 200 });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const raw = await req.text();
  const pairs = [...new URLSearchParams(raw).entries()] as [string, string][];
  const data = Object.fromEntries(pairs);

  // 1. signature (ITN: every field in received order, blanks included, signature excluded)
  const expected = await signature(pairs, false);
  if (expected !== data.signature) {
    console.error('ITN: bad signature', data.m_payment_id);
    return new Response('Bad signature', { status: 400 });
  }

  // 2. confirm with PayFast that the data is genuine
  const check = await fetch(`${pfHost()}/eng/query/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: paramString(pairs, false),
  });
  const verdict = (await check.text()).trim();
  if (verdict !== 'VALID') {
    console.error('ITN: PayFast validation failed', verdict);
    return new Response('Invalid', { status: 400 });
  }

  // 3. match to the order
  const db = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey(), { auth: { persistSession: false } });
  const { data: order } = await db.from('orders').select('id, total, status').eq('id', data.m_payment_id).maybeSingle();
  if (!order) { console.error('ITN: unknown order', data.m_payment_id); return ok(); }
  if (Math.abs(Number(order.total) - Number(data.amount_gross)) > 0.01) {
    console.error('ITN: amount mismatch', order.id, order.total, data.amount_gross);
    await db.from('orders').update({ status: 'failed', payment_data: data }).eq('id', order.id);
    return ok();
  }
  if (order.status !== 'pending') return ok(); // already handled (ITNs can repeat)

  const status = data.payment_status === 'COMPLETE' ? 'paid' : data.payment_status === 'CANCELLED' ? 'cancelled' : 'failed';
  // the status filter makes this a one-time transition, so stock is only ever taken once per order
  const { data: changed } = await db.from('orders').update({
    status,
    pf_payment_id: data.pf_payment_id ?? null,
    payment_data: data,
    paid_at: status === 'paid' ? new Date().toISOString() : null,
  }).eq('id', order.id).eq('status', 'pending').select('id');

  if (status === 'paid' && changed?.length) {
    const { error } = await db.rpc('apply_order_stock', { p_order: order.id });
    if (error) console.error('ITN: stock update failed', order.id, error.message);
  }

  return ok();
});
