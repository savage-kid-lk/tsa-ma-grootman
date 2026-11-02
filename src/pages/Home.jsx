import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';
import usePageTitle from '../usePageTitle.js';

const VALUES = [
  { icon: 'crown', title: 'Premium Quality', sub: '300 GSM Cotton' },
  { icon: 'truck', title: 'Nationwide Delivery', sub: 'Across South Africa' },
  { icon: 'card', title: 'Secure Payments', sub: 'Safe & Trusted' },
  { icon: 'music', title: 'Music Inspired', sub: 'For the Culture' },
];
const GENRES = ['Deep House', 'Old School R&B', 'Hip Hop', 'Kwaito'];

export function Values({ items = VALUES }) {
  return (
    <div className="values">
      {items.map((v) => (
        <div className="value" key={v.title}>
          <i><Icon name={v.icon} /></i>
          <strong>{v.title}</strong>
          <span>{v.sub}</span>
        </div>
      ))}
    </div>
  );
}

export function Newsletter() {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  return (
    <section className="section newsletter" id="newsletter">
      <div className="container">
        <span className="eyebrow">Join the Grootman Circle</span>
        <h2>First access. Event invites.</h2>
        <p>New drops, curated DJ events and live sessions — straight to your inbox.</p>
        <form
          className="inline-form"
          onSubmit={(e) => { e.preventDefault(); setEmail(''); showToast('Welcome to the Grootman Circle.'); }}
        >
          <input type="email" required placeholder="Your email address" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-dark" type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  usePageTitle(null);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-media"><img src="/img/hero.jpg" alt="White Tsa Ma Grootman crest tee under a spotlight" /></div>
        <div className="container hero-content">
          <span className="eyebrow">South African Lifestyle Brand</span>
          <hr className="rule" />
          <h1>Tsa Ma<br />Grootman.</h1>
          <p className="tagline">Your move.<br />Your statement.</p>
          <Link to="/shop" className="btn btn-light">Shop now <Icon name="arrow" /></Link>
        </div>
      </section>

      {/* FEATURED */}
      <section className="featured">
        <div className="container featured-grid">
          <Reveal>
            <span className="eyebrow">Featured Collection</span>
            <h2>Classics<br />never fade.</h2>
            <hr className="rule" />
            <p>Premium heavyweight tees inspired by music, culture and the life of a true Grootman.</p>
            <Link to="/shop?c=logo" className="btn btn-dark">View collection <Icon name="arrow" /></Link>
          </Reveal>
          <Reveal className="featured-img">
            <img src="/img/featured-folded.jpg" alt="Folded white and black Grootman Classic tees" loading="lazy" />
          </Reveal>
        </div>
      </section>

      {/* VALUES */}
      <section className="brand-band">
        <div className="container">
          <h2>More than a brand</h2>
          <hr className="rule" />
          <p>Tsa Ma Grootman is for the modern South African gent — independent, outgoing, and rooted in music, culture and good company.</p>
          <Values />
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">The Line-up</span><h2>Shop the tees</h2></div>
            <Link to="/shop" className="text-link">View all <Icon name="arrow" /></Link>
          </div>
          <Reveal><ProductGrid ids={['the-statement', 'the-selector', 'grootman-classic', 'crate-digger']} /></Reveal>
        </div>
      </section>

      {/* SOUNDSCAPE */}
      <section className="sound" aria-label="Our soundscape: Deep House, Old School R&B, Hip Hop, Kwaito">
        <div className="marquee" aria-hidden="true">
          {[0, 1, 2, 3].flatMap((r) =>
            GENRES.map((g, i) => <span key={`${r}-${g}`} className={i % 2 ? 'outline' : ''}>{g}</span>),
          )}
        </div>
      </section>

      {/* MUSIC COLLECTION */}
      <section className="section">
        <div className="container split">
          <Reveal className="split-img">
            <img src="/img/lookbook-fresh.jpg" alt="Black Selector turntable tee folded on a wooden table with vinyl and headphones" loading="lazy" />
          </Reveal>
          <Reveal>
            <span className="eyebrow">The Music Collection</span>
            <h2>Dressed for the<br />Sunday session.</h2>
            <hr className="rule" />
            <p>Turntables, mixtapes and vinyl sleeves. The music collection honours the sounds that raised us — from Kwaito on the taxi radio to Deep House at the after-party.</p>
            <p className="muted">Every print sits on our heavyweight 300 GSM cotton tee, with the Grootman crest on the neck label.</p>
            <Link to="/shop?c=music" className="btn btn-outline" style={{ marginTop: 12 }}>Shop music tees <Icon name="arrow" /></Link>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal><ProductGrid className="grid cols-3" ids={['the-mixtape', 'side-a', 'retro-tape']} /></Reveal>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Lookbook</span><h2>Ke grootman</h2></div>
            <Link to="/about" className="text-link">Our story <Icon name="arrow" /></Link>
          </div>
          <Reveal className="lookbook">
            <figure><img src="/img/lookbook-vinyl.jpg" alt="White Selector turntable tee with vinyl records" loading="lazy" /></figure>
            <figure><img src="/img/lookbook-wall.jpg" alt="Six Tsa Ma Grootman tees displayed on a white brick wall" loading="lazy" /></figure>
            <figure><img src="/img/lookbook-stack.jpg" alt="Stack of folded tees and brand swing tag" loading="lazy" /></figure>
            <figure><img src="/img/lookbook-detail.jpg" alt="Close-up of the crest print and neck label" loading="lazy" /></figure>
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
