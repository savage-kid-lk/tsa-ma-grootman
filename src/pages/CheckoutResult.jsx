import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useStore } from '../context/StoreContext.jsx';
import { formatZAR } from '../data/products.js';
import { OrderItems } from './account/Account.jsx';
import usePageTitle from '../usePageTitle.js';

/** PayFast sends the shopper back here. The order is marked paid by the ITN webhook, so poll for it. */
export default function CheckoutResult() {
  usePageTitle('Order status');
  const [params] = useSearchParams();
  const id = params.get('order');
  const cancelled = params.get('cancelled') === '1';
  const { clearCart } = useStore();
  const [order, setOrder] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let stop = false;
    let timer;
    const load = async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
      if (stop) return;
      setOrder(data);
      setTries((t) => t + 1);
      if (cancelled || (data && data.status !== 'pending')) clearInterval(timer);
    };
    load();
    timer = setInterval(load, 3000);
    return () => { stop = true; clearInterval(timer); };
  }, [id, cancelled]);

  const paid = order && ['paid', 'processing', 'shipped', 'delivered'].includes(order.status);
  useEffect(() => { if (paid) clearCart(); }, [paid, clearCart]);

  let heading; let body;
  if (cancelled) {
    heading = 'Payment cancelled';
    body = <p>No money was taken. Your cart is still saved — you can try again whenever you're ready.</p>;
  } else if (paid) {
    heading = 'Sharp move, grootman.';
    body = <p>Payment received — thank you, {order.full_name.split(' ')[0]}. We'll dispatch your order within 1–2 working days; delivery is free and takes 3–5 working days.</p>;
  } else if (order && ['failed', 'cancelled'].includes(order.status)) {
    heading = 'Payment unsuccessful';
    body = <p>PayFast couldn't complete this payment. Your cart is still saved — please try again.</p>;
  } else {
    heading = 'Confirming your payment…';
    body = <p>{tries > 10 ? "This is taking longer than usual. We'll update your order as soon as PayFast confirms — you can check it in your account." : 'Hang tight while PayFast confirms your payment.'}</p>;
  }

  return (
    <div className="container">
      <div className="success">
        {order && <span className="eyebrow">Order {order.number} · {formatZAR(order.total)}</span>}
        <h1>{heading}</h1>
        <hr className="rule center" />
        {body}
        {!cancelled && !paid && !(order && ['failed', 'cancelled'].includes(order.status)) && <span className="spinner" />}
        {paid && <div style={{ textAlign: 'left', marginTop: 28 }}><OrderItems items={order.order_items} /></div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          {paid ? <Link to="/shop" className="btn btn-dark">Keep shopping</Link> : <Link to="/checkout" className="btn btn-dark">Back to checkout</Link>}
          <Link to="/account" className="btn btn-outline">My orders</Link>
        </div>
      </div>
    </div>
  );
}
