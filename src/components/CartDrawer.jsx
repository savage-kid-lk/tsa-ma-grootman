import { Link } from 'react-router-dom';
import { colorImage, formatZAR } from '../data/products.js';

const totalFor = (items, id) => items.reduce((s, l) => (l.id === id ? s + l.qty : s), 0);
import { useCatalog } from '../context/CatalogContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import Icon from './Icon.jsx';

export default function CartDrawer() {
  const { items, total, setQty, panel, closePanel } = useStore();
  const { getProduct } = useCatalog();
  const open = panel === 'cart';

  return (
    <aside className="drawer" aria-label="Shopping cart" aria-hidden={!open} inert={!open}>
      <div className="drawer-head">
        <h3>Your Cart</h3>
        <button className="icon-btn" onClick={closePanel} aria-label="Close cart"><Icon name="close" /></button>
      </div>

      <div className="drawer-body">
        {items.length === 0 ? (
          <div className="empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-outline" onClick={closePanel}>Shop the collection</Link>
          </div>
        ) : (
          items.map((l, i) => {
            const p = getProduct(l.id);
            if (!p) return null;
            return (
              <div className="line" key={`${l.id}-${l.color}-${l.size}`}>
                <Link to={`/product/${p.id}`} className="line-img" onClick={closePanel}><img src={colorImage(p, l.color)} alt={p.name} /></Link>
                <div className="line-info">
                  <Link to={`/product/${p.id}`} className="line-name" onClick={closePanel}>{p.name}</Link>
                  <span className="muted small">{l.color} · Size {l.size}</span>
                  {!p.unlimitedStock && p.stock <= p.lowStockThreshold && <span className="stock-mini">Only {p.stock} left</span>}
                  <div className="qty">
                    <button onClick={() => setQty(i, l.qty - 1)} aria-label="Decrease quantity">−</button>
                    <span>{l.qty}</span>
                    <button onClick={() => setQty(i, l.qty + 1)} aria-label="Increase quantity" disabled={l.qty >= 20 || (!p.unlimitedStock && totalFor(items, p.id) >= p.stock)}>+</button>
                  </div>
                </div>
                <div className="line-price">
                  {formatZAR(p.price * l.qty)}
                  <button className="link-btn" onClick={() => setQty(i, 0)}>Remove</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="drawer-foot">
        <div className="row"><span>Subtotal</span><strong>{formatZAR(total)}</strong></div>
        <p className="muted small">Delivery: free nationwide. VAT included.</p>
        <Link to="/checkout" className={`btn btn-dark btn-block ${items.length ? '' : 'is-disabled'}`} onClick={closePanel}>
          Checkout <Icon name="arrow" />
        </Link>
      </div>
    </aside>
  );
}
