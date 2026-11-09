import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useCatalog } from './CatalogContext.jsx';

const CART_KEY = 'tmg_cart';
const StoreContext = createContext(null);

function loadCart() {
  try {
    const v = localStorage.getItem(CART_KEY);
    const parsed = v ? JSON.parse(v) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.id === 'string' && l.qty > 0) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const { products, loading, getProduct } = useCatalog();
  const [items, setItems] = useState(loadCart);

  // once the catalogue has loaded, drop lines whose product/colour/size no longer exists
  useEffect(() => {
    if (loading) return;
    // also trim quantities so a product's lines never exceed its stock
    setItems((prev) => {
      const left = {};
      let changed = false;
      const next = [];
      for (const l of prev) {
        const p = getProduct(l.id);
        if (!p || !p.colors.some((c) => c.name === l.color) || !p.sizes.includes(l.size)) { changed = true; continue; }
        if (p.unlimitedStock) { next.push(l); continue; }
        if (left[p.id] === undefined) left[p.id] = Math.min(p.stock, 20);
        const qty = Math.min(l.qty, left[p.id]);
        left[p.id] -= qty;
        if (qty !== l.qty) changed = true;
        if (qty > 0) next.push(qty === l.qty ? l : { ...l, qty });
      }
      return changed ? next : prev;
    });
  }, [loading, products, getProduct]);
  const [panel, setPanel] = useState(null); // 'cart' | 'search' | 'nav' | null
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  // keep tabs in sync
  useEffect(() => {
    const onStorage = (e) => { if (e.key === CART_KEY) setItems(loadCart()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // lock page scroll while a panel is open, close on Escape
  useEffect(() => {
    document.body.classList.toggle('cart-open', panel === 'cart');
    document.body.classList.toggle('search-open', panel === 'search');
    document.body.classList.toggle('nav-open', panel === 'nav');
    const onKey = (e) => { if (e.key === 'Escape') setPanel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  // how many more of a product fit, given stock and the other cart lines for it
  const room = (prev, id, skipIndex = -1) => {
    const p = getProduct(id);
    if (!p || p.unlimitedStock) return Infinity;
    const used = prev.reduce((s, l, i) => (l.id === id && i !== skipIndex ? s + l.qty : s), 0);
    return Math.max(0, p.stock - used);
  };

  const addItem = useCallback((id, color, size, qty = 1) => {
    setItems((prev) => {
      const add = Math.min(qty, room(prev, id));
      if (add <= 0) return prev;
      const i = prev.findIndex((l) => l.id === id && l.color === color && l.size === size);
      if (i === -1) return [...prev, { id, color, size, qty: Math.min(add, 20) }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(next[i].qty + add, 20) };
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProduct]);

  const setQty = useCallback((index, qty) => {
    setItems((prev) => {
      if (!prev[index]) return prev;
      if (qty < 1) return prev.filter((_, i) => i !== index);
      const q = Math.min(qty, 20, room(prev, prev[index].id, index));
      if (q < 1 || q === prev[index].qty) return prev;
      const next = [...prev];
      next[index] = { ...next[index], qty: q };
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProduct]);

  const clearCart = useCallback(() => setItems([]), []);

  const showToast = useCallback((message, action) => {
    setToast({ message, action, key: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((s, l) => s + l.qty, 0);
    const total = items.reduce((s, l) => s + (getProduct(l.id)?.price || 0) * l.qty, 0);
    return {
      items, count, total, addItem, setQty, clearCart,
      panel, openPanel: setPanel, closePanel: () => setPanel(null),
      toast, showToast,
    };
  }, [items, panel, toast, addItem, setQty, clearCart, showToast, getProduct]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
