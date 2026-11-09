import { Link } from 'react-router-dom';
import { STORE } from '../data/products.js';
import Icon from './Icon.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/img/logo-white.png" alt="Tsa Ma Grootman" width="96" height="96" />
          <p>Premium heavyweight tees for the modern South African grootman. Rooted in township culture, music and good company.</p>
          <div className="socials">
            <a href={STORE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="ig" /></a>
            <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Icon name="wa" /></a>
            <a href={`mailto:${STORE.email}`} aria-label="Email"><Icon name="mail" /></a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All tees</Link>
          <Link to="/shop?c=music">Music collection</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/contact#orders">Orders &amp; delivery</Link>
          <Link to="/contact#sizing">Size guide</Link>
          <Link to="/contact#returns">Returns &amp; exchanges</Link>
          <Link to="/contact">Contact us</Link>
        </div>
        <div>
          <h4>The Brand</h4>
          <Link to="/about">Our story</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Tsa Ma Grootman. Made in South Africa.</span>
        <span>Your move. Your statement.</span>
      </div>
    </footer>
  );
}
