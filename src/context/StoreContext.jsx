import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProduct } from '../data/products.js';

const CART_KEY = 'tmg_cart';
const StoreContext = createContext(null);

function loadCart() {
  try {
    const v = localStorage.getItem(CART_KEY);
    const parsed = v ? JSON.parse(v) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => getProduct(l.id)) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [items, setItems] = useState(loadCart);
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

  const addItem = useCallback((id, color, size, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((l) => l.id === id && l.color === color && l.size === size);
      if (i === -1) return [...prev, { id, color, size, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, 20) };
      return next;
    });
  }, []);

  const setQty = useCallback((index, qty) => {
    setItems((prev) => {
      if (!prev[index]) return prev;
      if (qty < 1) return prev.filter((_, i) => i !== index);
      const next = [...prev];
      next[index] = { ...next[index], qty: Math.min(qty, 20) };
      return next;
    });
  }, []);

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
  }, [items, panel, toast, addItem, setQty, clearCart, showToast]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
