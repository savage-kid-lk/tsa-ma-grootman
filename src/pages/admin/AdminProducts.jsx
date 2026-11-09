import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, PRODUCT_BUCKET } from '../../lib/supabase.js';
import { PRODUCT_SELECT, collectionLabel, formatZAR, mapProduct, stockStatus } from '../../data/products.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import Icon from '../../components/Icon.jsx';
import usePageTitle from '../../usePageTitle.js';

export function StockCell({ product: p }) {
  const st = stockStatus(p);
  if (st === 'unlimited') return <span className="muted">Unlimited</span>;
  if (st === 'out') return <span className="pill pill-failed">Sold out</span>;
  if (st === 'low') return <span className="pill pill-pending">{p.stock} · low</span>;
  return <span>{p.stock}</span>;
}

export default function AdminProducts() {
  usePageTitle('Products');
  const { refresh } = useCatalog();
  const { showToast } = useStore();
  const [rows, setRows] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [q, setQ] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).order('sort_order').order('created_at');
    if (error) showToast(error.message);
    setRows((data || []).map((r) => ({ ...mapProduct(r), raw: r })));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const toggle = async (p, field) => {
    const { error } = await supabase.from('products').update({ [field]: !p[field] }).eq('id', p.id);
    if (error) { showToast(error.message); return; }
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, [field]: !p[field] } : r)));
    refresh();
  };

  const remove = async (p) => {
    const paths = p.raw.product_images.map((i) => i.storage_path).filter(Boolean);
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { showToast(error.message); return; }
    if (paths.length) await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
    setRows((rs) => rs.filter((r) => r.id !== p.id));
    setConfirm(null);
    showToast(`Deleted ${p.name}`);
    refresh();
  };

  const list = (rows || []).filter((p) => !q || `${p.name} ${p.id} ${p.collection}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="admin-head">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-dark"><Icon name="plus" /> Add product</Link>
      </div>
      <input className="admin-search" type="search" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
      {rows === null ? <span className="spinner" /> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th /><th>Product</th><th>Collection</th><th className="num">Price</th><th>Stock</th><th>Colours</th><th>Images</th><th>Visible</th><th>Featured</th><th /></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'is-muted'}>
                  <td><img className="admin-thumb" src={p.images[0]?.url || '/img/logo-black.png'} alt="" /></td>
                  <td><Link to={`/admin/products/${p.id}`}><strong>{p.name}</strong></Link></td>
                  <td>{collectionLabel(p.collection)}</td>
                  <td className="num">{formatZAR(p.price)}</td>
                  <td><StockCell product={p} /></td>
                  <td><div className="swatches">{p.colors.map((c) => <span key={c.id} style={{ '--c': c.hex }} title={c.name} />)}</div></td>
                  <td>{p.images.length}</td>
                  <td><button type="button" className={`switch ${p.active ? 'on' : ''}`} onClick={() => toggle(p, 'active')} aria-pressed={p.active} aria-label="Visible in store" /></td>
                  <td><button type="button" className={`switch ${p.featured ? 'on' : ''}`} onClick={() => toggle(p, 'featured')} aria-pressed={p.featured} aria-label="Featured on home page" /></td>
                  <td className="row-actions">
                    {confirm === p.id ? (
                      <>
                        <button type="button" className="btn-mini danger" onClick={() => remove(p)}>Delete</button>
                        <button type="button" className="btn-mini" onClick={() => setConfirm(null)}>Keep</button>
                      </>
                    ) : (
                      <>
                        <Link to={`/admin/products/${p.id}`} className="icon-btn" aria-label={`Edit ${p.name}`}><Icon name="edit" /></Link>
                        <button type="button" className="icon-btn" onClick={() => setConfirm(p.id)} aria-label={`Delete ${p.name}`}><Icon name="trash" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
