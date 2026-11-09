import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { PROVINCES, colorImage, formatZAR } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import usePageTitle from '../usePageTitle.js';

function Summary({ items, total }) {
  const { getProduct } = useCatalog();
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      {items.map((l) => {
        const p = getProduct(l.id);
        if (!p) return null;
        return (
          <div className="sum-line" key={`${l.id}-${l.color}-${l.size}`}>
            <img src={colorImage(p, l.color)} alt="" />
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
      <div className="row muted small"><span>Includes VAT (15%)</span><span>{formatZAR(Math.round((total - total / 1.15) * 100) / 100)}</span></div>
      <div className="row total"><span>Total</span><span>{formatZAR(total)}</span></div>
    </aside>
  );
}

/** Post the signed fields to PayFast — a real form submit, so the browser leaves for PayFast's page. */
function redirectToPayFast(action, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = k; input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

async function errorMessage(error) {
  try { const body = await error.context.json(); if (body?.error) return body.error; } catch { /* not JSON */ }
  return error.message || 'Could not start payment. Please try again.';
}

export default function Checkout() {
  usePageTitle('Checkout');
  const { items, total } = useStore();
  const { loading } = useCatalog();
  const { ready, user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!ready || loading) return <div className="container notfound"><span className="spinner" aria-label="Loading" /></div>;
  if (!user) return <Navigate to="/login?next=/checkout" replace />;

  if (!items.length) {
    return (
      <div className="container success">
        <h1>Your cart is empty</h1>
        <p className="muted" style={{ margin: '16px 0 28px' }}>Find your next statement piece.</p>
        <Link to="/shop" className="btn btn-dark">Shop the collection</Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const customer = Object.fromEntries(new FormData(f));
    setBusy(true); setError('');
    const { data, error: err } = await supabase.functions.invoke('create-payment', {
      body: { items: items.map((l) => ({ productId: l.id, color: l.color, size: l.size, qty: l.qty })), customer },
    });
    if (err) { setError(await errorMessage(err)); setBusy(false); return; }
    redirectToPayFast(data.action, data.fields);
  };

  return (
    <div className="container">
      <div className="crumbs" style={{ paddingTop: 28, color: 'var(--muted)' }}><Link to="/">Home</Link> / Checkout</div>
      <div className="checkout-grid">
        <form onSubmit={submit} noValidate>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 28 }}>Checkout</h1>

          <span className="eyebrow">Contact</span>
          <div className="form-grid" style={{ marginBottom: 36 }}>
            <div className="field"><label htmlFor="f-name">Full name</label><input id="f-name" name="name" required autoComplete="name" defaultValue={profile?.full_name || ''} /></div>
            <div className="field"><label htmlFor="f-phone">Cell number</label><input id="f-phone" name="phone" type="tel" required autoComplete="tel" placeholder="e.g. 082 123 4567" defaultValue={profile?.phone || ''} /></div>
            <div className="field full"><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" required autoComplete="email" defaultValue={user.email} /></div>
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
            <label>
              <input type="radio" name="gateway" value="payfast" defaultChecked />
              <span><strong>PayFast</strong><small>Card, Instant EFT, SnapScan, Zapper and more — you'll pay on PayFast's secure page</small></span>
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-dark btn-block" type="submit" disabled={busy}>
            {busy ? 'Connecting to PayFast…' : `Pay ${formatZAR(total)} with PayFast`}
          </button>
          <p className="muted small" style={{ marginTop: 14 }}>Test mode: this store uses the PayFast sandbox, so no real money is charged.</p>
        </form>
        <Summary items={items} total={total} />
      </div>
    </div>
  );
}
