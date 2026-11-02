import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import SearchPanel from './SearchPanel.jsx';

function Toast() {
  const { toast, openPanel } = useStore();
  return (
    <div className={`toast ${toast ? 'show' : ''}`} role="status">
      {toast && (
        <>
          <span>{toast.message}</span>
          {toast.action === 'cart' && <button className="toast-link" onClick={() => openPanel('cart')}>View cart</button>}
        </>
      )}
    </div>
  );
}

/** Scroll to top on page change, or to the #hash target when one is given. */
function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  const { closePanel } = useStore();

  useEffect(() => {
    closePanel();
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        if (el.tagName === 'DETAILS') el.open = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search, hash]);

  return null;
}

export default function Layout() {
  const { closePanel } = useStore();
  return (
    <>
      <ScrollManager />
      <Header />
      <main><Outlet /></main>
      <Footer />
      <div className="scrim" onClick={closePanel} />
      <CartDrawer />
      <SearchPanel />
      <Toast />
    </>
  );
}
