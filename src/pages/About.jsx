import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { Values } from './Home.jsx';
import usePageTitle from '../usePageTitle.js';

const SOUND = [
  { icon: 'music', title: 'Deep House', sub: 'Sunday sessions' },
  { icon: 'music', title: 'Old School R&B', sub: 'Slow jams' },
  { icon: 'music', title: 'Hip Hop', sub: 'Golden era' },
  { icon: 'music', title: 'Kwaito', sub: 'Born in the township' },
];

export default function About() {
  usePageTitle('About', 'Tsa Ma Grootman is a South African premium fashion brand rooted in township culture, music and the modern grootman mindset.');

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / About</div>
          <h1>Ke Grootman.</h1>
          <p>A South African fashion brand rooted in township culture, street language, music and lifestyle.</p>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">The Brand</span>
            <h2>Not defined by age. Defined by mindset.</h2>
            <hr className="rule" />
            <p>Tsa Ma Grootman represents a specific kind of man — the modern South African <em>grootman</em>. He carries confidence, experience and self-respect, while still enjoying the finer things in life.</p>
            <p>He acknowledges, “ke grootman,” but remains socially active, stylish and connected to culture. He appreciates quality, values presentation and gravitates toward premium experiences.</p>
            <p className="muted">We're starting with premium-quality T-shirts — with plans to grow as the brand grows.</p>
          </Reveal>
          <Reveal className="split-img"><img src="/img/statement-white.jpg" alt="The Statement tee in white under a spotlight" loading="lazy" /></Reveal>
        </div>
      </section>

      <section className="brand-band" id="sound">
        <div className="container">
          <h2>The Soundscape</h2>
          <hr className="rule" />
          <p>Music plays a central role in shaping who we are. These are the genres that resonate with our people and their lived experiences.</p>
          <Values items={SOUND} />
        </div>
      </section>

      <section className="section" id="events">
        <div className="container split">
          <Reveal className="split-img"><img src="/img/lookbook-fresh.jpg" alt="Selector tee with records and headphones" loading="lazy" /></Reveal>
          <Reveal>
            <span className="eyebrow">Events</span>
            <h2>Where the brand comes alive.</h2>
            <hr className="rule" />
            <p>We bring the community together through curated events featuring DJs and live performances. They're more than promotions — they're cultural touchpoints where good music meets good company.</p>
            <p className="muted">Join the Grootman Circle to get first word on upcoming events.</p>
            <Link to="/#newsletter" className="btn btn-outline" style={{ marginTop: 12 }}>Get event invites <Icon name="arrow" /></Link>
          </Reveal>
        </div>
      </section>

      <section className="section newsletter">
        <div className="container">
          <span className="eyebrow">Early days, big vision</span>
          <h2>From Mzansi to the world.</h2>
          <p>Tsa Ma Grootman is in its early stages, with a clear vision to grow into a recognisable lifestyle brand within South Africa and beyond.</p>
          <Link to="/shop" className="btn btn-dark">Shop the collection <Icon name="arrow" /></Link>
        </div>
      </section>
    </>
  );
}
