import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collectionLabel } from '../data/products.js';
import { useCatalog } from '../context/CatalogContext.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';
import usePageTitle from '../usePageTitle.js';


export default function Shop() {
  usePageTitle('Shop');
  const { products, collections } = useCatalog();
  const [params, setParams] = useSearchParams();
  const FILTERS = [{ key: 'all', label: 'All tees' }, ...collections.map((c) => ({ key: c, label: collectionLabel(c) }))];
  const filter = collections.includes(params.get('c')) ? params.get('c') : 'all';
  const [sort, setSort] = useState('featured');

  const list = useMemo(() => {
    let l = products.filter((p) => filter === 'all' || p.collection === filter);
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price);
    if (sort === 'az') l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [filter, sort, products]);

  const setFilter = (key) => setParams(key === 'all' ? {} : { c: key }, { replace: true });

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Shop</div>
          <h1>The Collection</h1>
          <p>Heavyweight 300 GSM tees, built for the man who has come into his own. All prices in South African Rand, VAT included.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="toolbar">
            <div className="chips" role="group" aria-label="Filter by collection">
              {FILTERS.map((f) => (
                <button key={f.key} className={`chip ${filter === f.key ? 'is-active' : ''}`} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span className="muted small">{list.length} tee{list.length === 1 ? '' : 's'}</span>
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="az">Name: A–Z</option>
              </select>
            </div>
          </div>
          <ProductGrid products={list} />
        </div>
      </section>
    </>
  );
}
