import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import usePageTitle from '../usePageTitle.js';

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
