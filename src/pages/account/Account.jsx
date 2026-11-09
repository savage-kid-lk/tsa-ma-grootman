import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatZAR } from '../../data/products.js';
import StatusPill, { formatDate } from '../../components/StatusPill.jsx';
import Icon from '../../components/Icon.jsx';
import usePageTitle from '../../usePageTitle.js';

export function OrderItems({ items }) {
  return (
    <div className="order-items">
      {items.map((it) => (
        <div className="sum-line" key={it.id}>
          <img src={it.image || '/img/logo-black.png'} alt="" />
          <div>
            <strong style={{ textTransform: 'uppercase', fontSize: '.88rem' }}>{it.name}</strong><br />
            <span className="muted small">{it.color} · {it.size} · Qty {it.qty}</span>
          </div>
          <span>{formatZAR(it.unit_price * it.qty)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  usePageTitle('My account');
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const { showToast } = useStore();
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user.id]);

  const save = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: d.full_name, phone: d.phone }).eq('id', user.id);
    setSaving(false);
    if (error) showToast(error.message);
    else { showToast('Details saved.'); refreshProfile(); }
  };

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Account</div>
          <h1>Ke grootman{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.</h1>
          <p>{user.email}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container account-grid">
          <div>
            <div className="section-head" style={{ marginBottom: 24 }}><h2 style={{ fontSize: '1.8rem' }}>Your orders</h2></div>
            {orders === null ? <span className="spinner" /> : orders.length === 0 ? (
              <div className="empty" style={{ textAlign: 'left', padding: '24px 0' }}>
                <p className="muted">No orders yet.</p>
                <Link to="/shop" className="btn btn-outline">Shop the collection</Link>
              </div>
            ) : (
              <div className="order-list">
                {orders.map((o) => (
                  <div className="order-row" key={o.id}>
                    <button type="button" className="order-head" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>
                      <strong>{o.number}</strong>
                      <span className="muted small">{formatDate(o.created_at)}</span>
                      <StatusPill status={o.status} />
                      <span className="order-total">{formatZAR(o.total)}</span>
                      <Icon name={open === o.id ? 'up' : 'down'} />
                    </button>
                    {open === o.id && (
                      <div className="order-body">
                        <OrderItems items={o.order_items} />
                        <p className="muted small" style={{ marginTop: 12 }}>
                          Delivering to {o.full_name}, {o.address.address}, {o.address.suburb}, {o.address.city}, {o.address.province}, {o.address.postal}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="summary">
            <h3>Your details</h3>
            <form onSubmit={save} className="stack" key={profile?.id || 'loading'}>
              <div className="field"><label htmlFor="p-name">Full name</label><input id="p-name" name="full_name" defaultValue={profile?.full_name || ''} autoComplete="name" /></div>
              <div className="field"><label htmlFor="p-phone">Cell number</label><input id="p-phone" name="phone" type="tel" defaultValue={profile?.phone || ''} autoComplete="tel" /></div>
              <button className="btn btn-dark btn-block" disabled={saving}>{saving ? 'Saving…' : 'Save details'}</button>
            </form>
            <div className="stack" style={{ marginTop: 24 }}>
              {isAdmin && <Link to="/admin" className="btn btn-outline btn-block"><Icon name="grid" /> Store dashboard</Link>}
              <button type="button" className="btn btn-outline btn-block" onClick={signOut}><Icon name="logout" /> Sign out</button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
