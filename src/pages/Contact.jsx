import { Link } from 'react-router-dom';
import { STORE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import Icon from '../components/Icon.jsx';
import usePageTitle from '../usePageTitle.js';

const SIZE_CHART = [
  ['S', 51, 70], ['M', 54, 72], ['L', 57, 74], ['XL', 60, 76], ['2XL', 63, 78], ['3XL', 66, 80],
];
const TOPICS = ['Order enquiry', 'Sizing', 'Returns & exchanges', 'Events & bookings', 'Wholesale / collaboration', 'Other'];

export default function Contact() {
  usePageTitle('Contact', 'Contact Tsa Ma Grootman — orders, delivery, sizing, returns and event enquiries.');
  const { showToast } = useStore();

  const submit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(f));
    const body = `Name: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\n\n${d.message}`;
    window.location.href = `mailto:${STORE.email}?subject=${encodeURIComponent('[Website] ' + d.topic)}&body=${encodeURIComponent(body)}`;
    showToast('Opening your email app to send the message…');
  };

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Contact</div>
          <h1>Talk to us.</h1>
          <p>Orders, sizing, events or collaborations — we'd love to hear from you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Get in touch</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>We reply within one working day.</h2>
            <ul className="info-list">
              <li><Icon name="wa" /><a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>
              <li><Icon name="mail" /><a href={`mailto:${STORE.email}`}>{STORE.email}</a></li>
              <li><Icon name="ig" /><a href={STORE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>

            <div className="faq">
              <details id="orders" open>
                <summary>Orders &amp; delivery</summary>
                <p>Delivery is free on every order across South Africa. Orders are dispatched within 1–2 working days and typically arrive in 3–5 working days via courier. You'll receive tracking details by WhatsApp or email.</p>
              </details>
              <details id="sizing">
                <summary>Size guide</summary>
                <p>Our tees have a relaxed, structured fit. Measurements are chest width (armpit to armpit) and body length, in centimetres.</p>
                <table className="sizes">
                  <thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead>
                  <tbody>{SIZE_CHART.map(([s, c, l]) => <tr key={s}><td>{s}</td><td>{c}</td><td>{l}</td></tr>)}</tbody>
                </table>
              </details>
              <details id="returns">
                <summary>Returns &amp; exchanges</summary>
                <p>Unworn, unwashed items can be exchanged or returned within 14 days of delivery. Contact us with your order number and we'll arrange it. Sizing exchanges are on us.</p>
              </details>
              <details>
                <summary>Payment options</summary>
                <p>We accept card payments, Instant EFT and SnapScan. All prices are in South African Rand and include VAT.</p>
              </details>
            </div>
          </div>

          <form className="form-grid" onSubmit={submit} noValidate>
            <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" required autoComplete="name" /></div>
            <div className="field"><label htmlFor="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autoComplete="tel" /></div>
            <div className="field full"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required autoComplete="email" /></div>
            <div className="field full">
              <label htmlFor="c-topic">Topic</label>
              <select id="c-topic" name="topic">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field full"><label htmlFor="c-msg">Message</label><textarea id="c-msg" name="message" required /></div>
            <div className="full"><button className="btn btn-dark" type="submit">Send message <Icon name="arrow" /></button></div>
          </form>
        </div>
      </section>
    </>
  );
}
