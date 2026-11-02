import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STORE, formatZAR, getProduct, lineImage } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import usePageTitle from '../usePageTitle.js';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];
const PAYMENTS = [
  { value: 'Card', title: 'Card', note: 'Visa, Mastercard — secure payment link sent to you' },
  { value: 'Instant EFT', title: 'Instant EFT', note: 'Pay directly from your bank' },
  { value: 'SnapScan', title: 'SnapScan', note: 'Scan to pay with your phone' },
];

function Summary({ items, total }) {
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      {items.map((l) => {
        const p = getProduct(l.id);
        if (!p) return null;
        return (
          <div className="sum-line" key={`${l.id}-${l.color}-${l.size}`}>
            <img src={lineImage(l)} alt="" />
            <div>
              <strong style={{ textTransform: 'uppercase', fontSize: '.88rem' }}>{p.name}</strong><br />
              <span className="muted small">{l.color} · {l.size} · Qty {l.qty}</span>
            </div>
            <span>{formatZAR(p.price * l.qty)}</span>
          </div>
        );
      })}
      <div className="row" style={{ marginTop: 12 }}><span>Subtotal</span><span>{formatZAR(total)}</span></div>
      <div className="row"><span>Delivery</span><span>Free</span></div>
      <div className="row muted small"><span>Includes VAT (15%)</span><span>{formatZAR(total - total / 1.15)}</span></div>
      <div className="row total"><span>Total</span><span>{formatZAR(total)}</span></div>
    </aside>
  );
}

function Success({ order }) {
  return (
    <div className="success">
      <span className="eyebrow">Order {order.number}</span>
      <h1>Sharp move, grootman.</h1>
      <hr className="rule center" />
      <p>
        Thanks, {order.firstName}. Send your order to us below and we'll reply with your {order.payment} payment
        details. Delivery is free and takes 3–5 working days.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
        <a className="btn btn-dark" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(order.message)}`}>
          Send via WhatsApp
        </a>
        <a className="btn btn-outline" href={`mailto:${STORE.email}?subject=${encodeURIComponent('Order ' + order.number)}&body=${encodeURIComponent(order.message)}`}>
          Send via email
        </a>
      </div>
    </div>
  );
}

export default function Checkout() {
  usePageTitle('Checkout');
  const { items, total, clearCart } = useStore();
  const [order, setOrder] = useState(null);

  if (order) return <div className="container"><Success order={order} /></div>;

  if (!items.length) {
    return (
      <div className="container success">
        <h1>Your cart is empty</h1>
        <p className="muted" style={{ margin: '16px 0 28px' }}>Find your next statement piece.</p>
        <Link to="/shop" className="btn btn-dark">Shop the collection</Link>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(f));
    const number = 'TMG-' + Date.now().toString(36).toUpperCase().slice(-6);
    const lines = items
      .map((l) => { const p = getProduct(l.id); return `• ${l.qty} × ${p.name} (${l.color}, ${l.size}) — ${formatZAR(p.price * l.qty)}`; })
      .join('\n');
    const message =
      `New order ${number}\n\n${lines}\n\nTotal: ${formatZAR(total)} (free delivery)\nPayment: ${d.payment}\n\n` +
      `${d.name}\n${d.phone} · ${d.email}\n${d.address}, ${d.suburb}, ${d.city}, ${d.province}, ${d.postal}`;
    setOrder({ number, message, payment: d.payment, firstName: d.name.trim().split(/\s+/)[0] });
    clearCart();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="container">
      <div className="crumbs" style={{ paddingTop: 28, color: 'var(--muted)' }}><Link to="/">Home</Link> / Checkout</div>
      <div className="checkout-grid">
        <form onSubmit={submit} noValidate>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 28 }}>Checkout</h1>

          <span className="eyebrow">Contact</span>
          <div className="form-grid" style={{ marginBottom: 36 }}>
            <div className="field"><label htmlFor="f-name">Full name</label><input id="f-name" name="name" required autoComplete="name" /></div>
            <div className="field"><label htmlFor="f-phone">Cell number</label><input id="f-phone" name="phone" type="tel" required autoComplete="tel" placeholder="e.g. 082 123 4567" /></div>
            <div className="field full"><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" required autoComplete="email" /></div>
          </div>

          <span className="eyebrow">Delivery address</span>
          <div className="form-grid" style={{ marginBottom: 36 }}>
            <div className="field full"><label htmlFor="f-addr">Street address</label><input id="f-addr" name="address" required autoComplete="street-address" /></div>
            <div className="field"><label htmlFor="f-suburb">Suburb</label><input id="f-suburb" name="suburb" required /></div>
            <div className="field"><label htmlFor="f-city">City / Town</label><input id="f-city" name="city" required autoComplete="address-level2" /></div>
            <div className="field">
              <label htmlFor="f-prov">Province</label>
              <select id="f-prov" name="province" required defaultValue="">
                <option value="" disabled>Select…</option>
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field"><label htmlFor="f-code">Postal code</label><input id="f-code" name="postal" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="postal-code" /></div>
          </div>

          <span className="eyebrow">Payment</span>
          <div className="pay-opts" style={{ marginBottom: 32 }}>
            {PAYMENTS.map((p, i) => (
              <label key={p.value}>
                <input type="radio" name="payment" value={p.value} defaultChecked={i === 0} />
                <span><strong>{p.title}</strong><small>{p.note}</small></span>
              </label>
            ))}
          </div>

          <button className="btn btn-dark btn-block" type="submit">Place order · {formatZAR(total)}</button>
          <p className="muted small" style={{ marginTop: 14 }}>We'll confirm your order and send your secure payment link via WhatsApp and email.</p>
        </form>
        <Summary items={items} total={total} />
      </div>
    </div>
  );
}
