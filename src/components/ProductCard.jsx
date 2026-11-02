import { Link } from 'react-router-dom';
import { formatZAR, getProduct, img } from '../data/products.js';

export default function ProductCard({ product: p }) {
  const first = p.colors[0];
  const hover = p.colors[1]?.images[0] || first.images[1];
  const to = `/product/${p.id}`;

  return (
    <article className="card">
      <Link to={to} className="card-media">
        {p.badge && <span className="badge">{p.badge}</span>}
        <img src={img(first.images[0])} alt={`${p.name} in ${first.name}`} loading="lazy" />
        {hover && <img className="card-hover" src={img(hover)} alt="" loading="lazy" />}
      </Link>
      <div className="card-body">
        <div>
          <h3><Link to={to}>{p.name}</Link></h3>
          <div className="swatches" aria-label="Available colours">
            {p.colors.map((c) => <span key={c.name} style={{ '--c': c.hex }} title={c.name} />)}
          </div>
        </div>
        <span className="price">{formatZAR(p.price)}</span>
      </div>
    </article>
  );
}

/** Renders a grid of cards from a list of product ids. */
export function ProductGrid({ ids, products, className = 'grid' }) {
  const list = products || ids.map(getProduct).filter(Boolean);
  return (
    <div className={className}>
      {list.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
