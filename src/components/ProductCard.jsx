import { Link } from 'react-router-dom';
import { formatZAR, stockStatus } from '../data/products.js';
import { useCatalog } from '../context/CatalogContext.jsx';

export default function ProductCard({ product: p }) {
  const first = p.colors[0];
  const main = first?.images[0]?.url || p.images[0]?.url;
  const hover = p.colors[1]?.images[0]?.url || first?.images[1]?.url || p.images[1]?.url;
  const to = `/product/${p.id}`;
  const status = stockStatus(p);

  return (
    <article className={`card ${status === 'out' ? 'is-soldout' : ''}`}>
      <Link to={to} className="card-media">
        {status === 'out' ? <span className="badge badge-out">Sold out</span>
          : status === 'low' ? <span className="badge badge-low">Only {p.stock} left</span>
          : p.badge && <span className="badge">{p.badge}</span>}
        {main && <img src={main} alt={`${p.name}${first ? ` in ${first.name}` : ''}`} loading="lazy" />}
        {hover && hover !== main && <img className="card-hover" src={hover} alt="" loading="lazy" />}
      </Link>
      <div className="card-body">
        <div>
          <h3><Link to={to}>{p.name}</Link></h3>
          <div className="swatches" aria-label="Available colours">
            {p.colors.map((c) => <span key={c.id} style={{ '--c': c.hex }} title={c.name} />)}
          </div>
        </div>
        <span className="price">{formatZAR(p.price)}</span>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="card-media" />
      <div className="sk-line" /><div className="sk-line short" />
    </div>
  );
}

/** Grid of cards — from explicit products, a list of ids, or a `filter` over the catalogue. */
export function ProductGrid({ ids, products, filter, limit, className = 'grid' }) {
  const catalog = useCatalog();
  let list = products;
  if (!list && ids) list = ids.map(catalog.getProduct).filter(Boolean);
  if (!list) list = catalog.products.filter(filter || (() => true));
  if (limit) list = list.slice(0, limit);

  if (catalog.loading) {
    return <div className={className}>{Array.from({ length: limit || 4 }, (_, i) => <SkeletonCard key={i} />)}</div>;
  }
  if (!list.length) return <p className="muted">No tees to show yet.</p>;
  return (
    <div className={className}>
      {list.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
