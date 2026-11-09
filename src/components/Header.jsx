import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { STORE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const { count, panel, openPanel, closePanel } = useStore();
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navOpen = panel === 'nav';

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="announce">{STORE.freeDeliveryNote} &nbsp;·&nbsp; Prices in ZAR, VAT incl.</div>
      <div className="container header-inner">
        <button
          className="icon-btn nav-toggle"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          onClick={() => (navOpen ? closePanel() : openPanel('nav'))}
        >
          <Icon name={navOpen ? 'close' : 'menu'} />
        </button>

        <Link to="/" className="brand" aria-label="Tsa Ma Grootman home">
          <img src="/img/logo-black.png" alt="Tsa Ma Grootman" width="76" height="76" />
        </Link>

        <nav className="main-nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'is-active' : '')} onClick={closePanel}>
              {n.label}
            </NavLink>
          ))}
          {isAdmin && <NavLink to="/admin" onClick={closePanel}>Dashboard</NavLink>}
          <NavLink to={user ? '/account' : '/login'} className={({ isActive }) => `show-sm ${isActive ? 'is-active' : ''}`} onClick={closePanel}>
            {user ? 'My account' : 'Sign in'}
          </NavLink>
        </nav>

        <div className="header-actions">
          <button className="icon-btn" aria-label="Search" onClick={() => openPanel('search')}><Icon name="search" /></button>
          <Link className="icon-btn hide-sm" to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Sign in'} title={user ? 'My account' : 'Sign in'}><Icon name="user" /></Link>
          <button className="icon-btn cart-btn" aria-label={`Open cart, ${count} items`} onClick={() => openPanel('cart')}>
            <Icon name="cart" />
            <span className="cart-count" aria-live="polite">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
