import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collectionLabel, formatZAR, maxAddable, stockStatus } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import Icon from '../components/Icon.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';
import usePageTitle from '../usePageTitle.js';

function Related({ product }) {
  const { products } = useCatalog();
  const list = products.filter((x) => x.id !== product?.id)
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

/** Main image with prev/next, swipe, keyboard arrows, thumbnails and a full-screen zoom. */
function Gallery({ images, name }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const n = images.length;
  const go = (d) => setIdx((i) => (i + d + n) % n);

  useEffect(() => { setIdx(0); }, [images]);
  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!n) return <div className="gallery-main" />;
  const cur = images[Math.min(idx, n - 1)];

  const swipe = {
    onTouchStart: (e) => { touch.current = e.touches[0].clientX; },
    onTouchEnd: (e) => {
      if (touch.current == null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touch.current = null;
    },
  };

  return (
    <div className="gallery">
      <div className="gallery-main" {...swipe}>
        <button type="button" className="gallery-zoom" onClick={() => setZoom(true)} aria-label="View full size">
          <img src={cur.url} alt={cur.alt || name} />
        </button>
        {n > 1 && (
          <>
            <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label="Previous image"><Icon name="chevron" /></button>
            <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label="Next image"><Icon name="chevron" /></button>
            <span className="gallery-count">{idx + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="thumbs">
          {images.map((im, i) => (
            <button key={`${im.url}-${i}`} type="button" className={i === idx ? 'is-active' : ''} onClick={() => setIdx(i)} aria-label={`View image ${i + 1}`}>
              <img src={im.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="lightbox" role="dialog" aria-label={`${name} images`} onClick={() => setZoom(false)} {...swipe}>
          <img src={cur.url} alt={cur.alt || name} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="lightbox-close" aria-label="Close"><Icon name="close" /></button>
          {n > 1 && (
            <>
              <button type="button" className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image"><Icon name="chevron" /></button>
              <button type="button" className="gallery-nav next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image"><Icon name="chevron" /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProductDetail({ product: p }) {
  const { addItem, showToast, items } = useStore();
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const color = p.colors[colorIdx];
  const images = color?.images.length ? color.images : p.images;
  const status = stockStatus(p);
  const inCart = items.reduce((s, l) => (l.id === p.id ? s + l.qty : s), 0);
  const canAdd = maxAddable(p, inCart);
  const soldOut = status === 'out';

  useEffect(() => { setQty((q) => Math.max(1, Math.min(q, canAdd || 1))); }, [canAdd]);

  const add = () => {
    if (!color || canAdd < 1) return;
    if (!size) { setSizeError(true); return; }
    const n = Math.min(qty, canAdd);
    addItem(p.id, color.name, size, n);
    showToast(`Added ${p.name} (${color.name}, ${size})`, 'cart');
  };

  return (
    <div className="container">
      <div className="crumbs" style={{ paddingTop: 28, color: 'var(--muted)' }}>
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {p.name}
      </div>
      <div className="pdp">
        <Gallery images={images} name={p.name} />

        <div className="pdp-info">
          <span className="eyebrow">{collectionLabel(p.collection)} Collection</span>
          <h1>{p.name}</h1>
          <div className="pdp-price">{formatZAR(p.price)}</div>
          <span className="muted small">VAT included · Free delivery nationwide</span>
          {status === 'out' && <div className="stock-note out">Sold out — check back soon</div>}
          {status === 'low' && <div className="stock-note low">Only {p.stock} left in stock</div>}
          {status === 'in' && <div className="stock-note in">In stock</div>}
          <p className="pdp-desc">{p.description}</p>

          {p.colors.length > 0 && (
            <div className="opt-group">
              <div className="opt-label"><span>Colour: <span style={{ fontWeight: 400 }}>{color.name}</span></span></div>
              <div className="color-opts">
                {p.colors.map((c, i) => (
                  <button
                    key={c.id} type="button" style={{ '--c': c.hex }} title={c.name} aria-label={c.name}
                    aria-pressed={i === colorIdx} className={i === colorIdx ? 'is-active' : ''}
                    onClick={() => setColorIdx(i)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="opt-group">
            <div className="opt-label"><span>Size</span><Link to="/contact#sizing">Size guide</Link></div>
            <div className="size-opts">
              {p.sizes.map((s) => (
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
              <button type="button" onClick={() => setQty((q) => Math.min(canAdd || 1, q + 1))} disabled={qty >= canAdd} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn btn-dark" onClick={add} disabled={!color || canAdd < 1}>
              {soldOut ? 'Sold out' : canAdd < 1 ? 'All in your cart' : <>Add to cart <Icon name="arrow" /></>}
            </button>
          </div>
          {!soldOut && canAdd < 1 && <p className="muted small" style={{ marginTop: 10 }}>You have all {p.stock} available in your cart.</p>}

          <ul className="perks">
            <li><i><Icon name="crown" /></i> Heavyweight 300 GSM cotton, relaxed fit</li>
            <li><i><Icon name="truck" /></i> Free delivery across South Africa · 3–5 working days</li>
            <li><i><Icon name="card" /></i> Secure payment with PayFast · Card, Instant EFT and more</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const { getProduct, loading } = useCatalog();
  const p = getProduct(id);
  usePageTitle(p ? p.name : loading ? null : 'Tee not found', p ? `${p.name}: ${p.short} ${formatZAR(p.price)}, free nationwide delivery.` : undefined);

  if (loading) return <div className="container notfound"><span className="spinner" aria-label="Loading" /></div>;

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
