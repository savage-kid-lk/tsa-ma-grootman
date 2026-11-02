import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatZAR, img } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import Icon from './Icon.jsx';

export default function SearchPanel() {
  const { panel, closePanel } = useStore();
  const open = panel === 'search';
  const [q, setQ] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => input.current?.focus(), 50); }
  }, [open]);

  const results = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return PRODUCTS.filter((p) => {
      const hay = [p.name, p.short, p.description, p.collection, ...p.colors.map((c) => c.name)].join(' ').toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [q]);

  return (
    <div className="search-panel" aria-hidden={!open} inert={!open}>
      <div className="container">
        <div className="search-bar">
          <Icon name="search" />
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tees — e.g. turntable, black, cassette"
            aria-label="Search products"
          />
          <button className="icon-btn" onClick={closePanel} aria-label="Close search"><Icon name="close" /></button>
        </div>
        <div className="search-results">
          {results.length ? results.map((p) => (
            <Link key={p.id} className="search-item" to={`/product/${p.id}`} onClick={closePanel}>
              <img src={img(p.colors[0].images[0])} alt="" />
              <span><strong>{p.name}</strong><em>{formatZAR(p.price)}</em></span>
            </Link>
          )) : <p className="muted">No tees match “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}
