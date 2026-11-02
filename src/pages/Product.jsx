import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PRODUCTS, SIZES, formatZAR, getProduct, img } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import Icon from '../components/Icon.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';
import usePageTitle from '../usePageTitle.js';

function Related({ product }) {
  const list = PRODUCTS.filter((x) => x.id !== product?.id)
    .sort((a, b) => (b.collection === product?.collection) - (a.collection === product?.collection))
    .slice(0, 4);
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head"><div><span className="eyebrow">Complete the rotation</span><h2>You may also like</h2></div></div>
        <ProductGrid products={list} />
      </div>
    </section>
  );
}

function ProductDetail({ product: p }) {
  const { addItem, showToast } = useStore();
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const color = p.colors[colorIdx];

  const add = () => {
    if (!size) { setSizeError(true); return; }
    addItem(p.id, color.name, size, qty);
    showToast(`Added ${p.name} (${color.name}, ${size})`, 'cart');
  };

  return (
    <div className="container">
      <div className="crumbs" style={{ paddingTop: 28, color: 'var(--muted)' }}>
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {p.name}
      </div>
      <div className="pdp">
        <div>
          <div className="gallery-main"><img src={img(color.images[imgIdx])} alt={`${p.name} in ${color.name}`} /></div>
          {color.images.length > 1 && (
            <div className="thumbs">
              {color.images.map((f, i) => (
                <button key={f} type="button" className={i === imgIdx ? 'is-active' : ''} onClick={() => setImgIdx(i)} aria-label={`View image ${i + 1}`}>
                  <img src={img(f)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <span className="eyebrow">{p.collection === 'music' ? 'Music Collection' : 'Logo Collection'}</span>
          <h1>{p.name}</h1>
          <div className="pdp-price">{formatZAR(p.price)}</div>
          <span className="muted small">VAT included · Free delivery nationwide</span>
          <p className="pdp-desc">{p.description}</p>

          <div className="opt-group">
            <div className="opt-label"><span>Colour: <span style={{ fontWeight: 400 }}>{color.name}</span></span></div>
            <div className="color-opts">
              {p.colors.map((c, i) => (
                <button
                  key={c.name} type="button" style={{ '--c': c.hex }} title={c.name} aria-label={c.name}
                  aria-pressed={i === colorIdx} className={i === colorIdx ? 'is-active' : ''}
                  onClick={() => { setColorIdx(i); setImgIdx(0); }}
                />
              ))}
            </div>
          </div>

          <div className="opt-group">
            <div className="opt-label"><span>Size</span><Link to="/contact#sizing">Size guide</Link></div>
            <div className="size-opts">
              {SIZES.map((s) => (
                <button key={s} type="button" aria-pressed={s === size} className={s === size ? 'is-active' : ''} onClick={() => { setSize(s); setSizeError(false); }}>
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <div className="size-error" style={{ display: 'block' }}>Please choose a size.</div>}
          </div>

          <div className="buy-row">
            <div className="qty-box">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn btn-dark" onClick={add}>Add to cart <Icon name="arrow" /></button>
          </div>

          <ul className="perks">
            <li><i><Icon name="crown" /></i> Heavyweight 300 GSM cotton, relaxed fit</li>
            <li><i><Icon name="truck" /></i> Free delivery across South Africa · 3–5 working days</li>
            <li><i><Icon name="card" /></i> Secure payment · Card, Instant EFT or SnapScan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const p = getProduct(id);
  usePageTitle(p ? p.name : 'Tee not found', p ? `${p.name}: ${p.short} ${formatZAR(p.price)}, free nationwide delivery.` : undefined);

  return (
    <>
      {p ? (
        // key resets colour/size state when navigating between products
        <ProductDetail key={p.id} product={p} />
      ) : (
        <div className="container notfound">
          <h1 style={{ fontSize: '2.4rem', textTransform: 'uppercase' }}>Tee not found</h1>
          <p className="muted" style={{ margin: '16px 0 28px' }}>That product may have sold out or moved.</p>
          <Link to="/shop" className="btn btn-dark">Back to the shop</Link>
        </div>
      )}
      <Related product={p} />
    </>
  );
}
