import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { PRODUCT_SELECT, formatZAR, mapProduct, stockStatus } from '../../data/products.js';
import { StockCell } from './AdminProducts.jsx';
import StatusPill, { formatDate } from '../../components/StatusPill.jsx';
import usePageTitle from '../../usePageTitle.js';

const PAID = ['paid', 'processing', 'shipped', 'delivered'];

export default function AdminOverview() {
  usePageTitle('Dashboard');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { data: prods }] = await Promise.all([
        supabase.from('orders').select('id, number, full_name, total, status, created_at').order('created_at', { ascending: false }),
        supabase.from('products').select(PRODUCT_SELECT).order('sort_order'),
      ]);
      const all = (prods || []).map(mapProduct);
      const lowStock = all.filter((p) => ['low', 'out'].includes(stockStatus(p))).sort((a, b) => a.stock - b.stock);
      const list = orders || [];
      const paid = list.filter((o) => PAID.includes(o.status));
      setStats({
        revenue: paid.reduce((s, o) => s + Number(o.total), 0),
        paidCount: paid.length,
        toShip: list.filter((o) => o.status === 'paid' || o.status === 'processing').length,
        pending: list.filter((o) => o.status === 'pending').length,
        products: all.length,
        lowStock,
        recent: list.slice(0, 8),
      });
    })();
  }, []);

  if (!stats) return <span className="spinner" />;
  return (
    <>
      <div className="admin-head"><h1>Overview</h1></div>
      <div className="stat-row">
        <div className="stat"><span>Revenue (paid)</span><strong>{formatZAR(stats.revenue)}</strong></div>
        <div className="stat"><span>Paid orders</span><strong>{stats.paidCount}</strong></div>
        <div className="stat"><span>To ship</span><strong>{stats.toShip}</strong></div>
        <div className="stat"><span>Awaiting payment</span><strong>{stats.pending}</strong></div>
        <div className="stat"><span>Products</span><strong>{stats.products}</strong></div>
        <div className={`stat ${stats.lowStock.length ? 'stat-alert' : ''}`}><span>Low / sold out</span><strong>{stats.lowStock.length}</strong></div>
      </div>

      {stats.lowStock.length > 0 && (
        <>
          <div className="admin-head" style={{ marginTop: 40 }}><h2>Restock soon</h2><Link to="/admin/products" className="text-link">All products</Link></div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th /><th>Product</th><th>Stock</th><th className="num">Alert at</th></tr></thead>
              <tbody>
                {stats.lowStock.map((p) => (
                  <tr key={p.id}>
                    <td><img className="admin-thumb" src={p.images[0]?.url || '/img/logo-black.png'} alt="" /></td>
                    <td><Link to={`/admin/products/${p.id}`}><strong>{p.name}</strong></Link></td>
                    <td><StockCell product={p} /></td>
                    <td className="num">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="admin-head" style={{ marginTop: 40 }}>
        <h2>Recent orders</h2>
        <Link to="/admin/orders" className="text-link">All orders</Link>
      </div>
      {stats.recent.length === 0 ? <p className="muted">No orders yet.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="num">Total</th></tr></thead>
            <tbody>
              {stats.recent.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/orders?open=${o.id}`}><strong>{o.number}</strong></Link></td>
                  <td>{o.full_name}</td>
                  <td className="muted">{formatDate(o.created_at)}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td className="num">{formatZAR(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
