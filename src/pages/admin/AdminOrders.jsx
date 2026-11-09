import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { ORDER_STATUSES, formatZAR } from '../../data/products.js';
import { useStore } from '../../context/StoreContext.jsx';
import StatusPill, { formatDate } from '../../components/StatusPill.jsx';
import { OrderItems } from '../account/Account.jsx';
import Icon from '../../components/Icon.jsx';
import usePageTitle from '../../usePageTitle.js';

export default function AdminOrders() {
  usePageTitle('Orders');
  const { showToast } = useStore();
  const [params] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(params.get('open'));

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) showToast(error.message); setOrders(data || []); });
  }, [showToast]);

  const setStatus = async (o, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', o.id);
    if (error) { showToast(error.message); return; }
    setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status } : x)));
    showToast(`${o.number} → ${status}`);
  };

  const list = (orders || []).filter((o) =>
    (filter === 'all' || o.status === filter)
    && (!q || `${o.number} ${o.full_name} ${o.email}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <div className="admin-head"><h1>Orders</h1></div>
      <div className="toolbar" style={{ marginBottom: 20, paddingBottom: 16 }}>
        <div className="chips">
          {['all', ...ORDER_STATUSES].map((s) => (
            <button key={s} type="button" className={`chip ${filter === s ? 'is-active' : ''}`} onClick={() => setFilter(s)}>
              {s}{orders && s !== 'all' ? ` (${orders.filter((o) => o.status === s).length})` : ''}
            </button>
          ))}
        </div>
        <input className="admin-search" style={{ margin: 0 }} type="search" placeholder="Order #, name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
      </div>

      {orders === null ? <span className="spinner" /> : list.length === 0 ? <p className="muted">No orders match.</p> : (
        <div className="order-list">
          {list.map((o) => (
            <div className="order-row" key={o.id}>
              <button type="button" className="order-head" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>
                <strong>{o.number}</strong>
                <span>{o.full_name}</span>
                <span className="muted small">{formatDate(o.created_at)}</span>
                <StatusPill status={o.status} />
                <span className="order-total">{formatZAR(o.total)}</span>
                <Icon name={open === o.id ? 'up' : 'down'} />
              </button>
              {open === o.id && (
                <div className="order-body order-body-admin">
                  <OrderItems items={o.order_items} />
                  <div className="stack">
                    <div>
                      <span className="eyebrow" style={{ marginBottom: 6 }}>Customer</span>
                      {o.full_name}<br />
                      <a href={`mailto:${o.email}`}>{o.email}</a><br />
                      {o.phone && <a href={`tel:${o.phone}`}>{o.phone}</a>}
                    </div>
                    <div>
                      <span className="eyebrow" style={{ marginBottom: 6 }}>Deliver to</span>
                      {o.address.address}<br />{o.address.suburb}, {o.address.city}<br />{o.address.province}, {o.address.postal}
                    </div>
                    <div>
                      <span className="eyebrow" style={{ marginBottom: 6 }}>Payment</span>
                      {o.pf_payment_id ? <>PayFast #{o.pf_payment_id}<br /></> : <span className="muted">No PayFast payment yet<br /></span>}
                      {o.paid_at && <span className="muted small">Paid {formatDate(o.paid_at)}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor={`st-${o.id}`}>Status</label>
                      <select id={`st-${o.id}`} value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
