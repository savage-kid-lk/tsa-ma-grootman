/* =========================================================
   TSA MA GROOTMAN — shared layout, cart, search
   ========================================================= */

const ICONS = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.3h9.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/><circle cx="9.5" cy="20.5" r="1.3"/><circle cx="17.5" cy="20.5" r="1.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-6 6 6-6 6"/></svg>',
  crown: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 16l9 9 9-15 9 15 9-9-4 22H10z"/><path d="M10 42h28"/></svg>',
  truck: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 12h26v22H3zM29 20h9l7 7v7H29z"/><circle cx="12" cy="36" r="4"/><circle cx="37" cy="36" r="4"/></svg>',
  card: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="3"/><path d="M4 18h40M10 30h10"/></svg>',
  music: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 36V10l24-5v26"/><circle cx="12" cy="36" r="6"/><circle cx="36" cy="31" r="6"/><path d="M18 17l24-5"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
};

/* ---------- safe storage ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

/* ---------- cart ---------- */
const Cart = {
  key: 'tmg_cart',
  items() { return store.get(this.key, []); },
  save(items) { store.set(this.key, items); renderCart(); updateCount(); },
  add(id, color, size, qty = 1) {
    const items = this.items();
    const line = items.find((i) => i.id === id && i.color === color && i.size === size);
    if (line) line.qty = Math.min(line.qty + qty, 20);
    else items.push({ id, color, size, qty });
    this.save(items);
  },
  setQty(idx, qty) {
    const items = this.items();
    if (!items[idx]) return;
    if (qty < 1) items.splice(idx, 1); else items[idx].qty = Math.min(qty, 20);
    this.save(items);
  },
  clear() { this.save([]); },
  count() { return this.items().reduce((s, i) => s + i.qty, 0); },
  total() { return this.items().reduce((s, i) => s + (getProduct(i.id)?.price || 0) * i.qty, 0); },
};

function lineImage(line) {
  const p = getProduct(line.id);
  const c = p?.colors.find((c) => c.name === line.color) || p?.colors[0];
  return c ? IMG(c.images[0]) : '';
}

/* ---------- layout ---------- */
function renderLayout() {
  const page = document.body.dataset.page || '';
  const link = (href, label, key) =>
    `<a href="${href}" class="${page === key ? 'is-active' : ''}"${page === key ? ' aria-current="page"' : ''}>${label}</a>`;

  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <div class="announce">${STORE.freeDeliveryNote} &nbsp;·&nbsp; Prices in ZAR, VAT incl.</div>
      <div class="container header-inner">
        <button class="icon-btn nav-toggle" aria-label="Open menu" aria-expanded="false">${ICONS.menu}</button>
        <a href="index.html" class="brand" aria-label="Tsa Ma Grootman home">
          <img src="assets/img/logo-black.png" alt="Tsa Ma Grootman" width="76" height="76">
        </a>
        <nav class="main-nav" aria-label="Main">
          ${link('index.html', 'Home', 'home')}
          ${link('shop.html', 'Shop', 'shop')}
          ${link('about.html', 'About', 'about')}
          ${link('contact.html', 'Contact', 'contact')}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" data-open-search aria-label="Search">${ICONS.search}</button>
          <a class="icon-btn hide-sm" href="contact.html#orders" aria-label="Order help">${ICONS.user}</a>
          <button class="icon-btn cart-btn" data-open-cart aria-label="Open cart">${ICONS.cart}<span class="cart-count" aria-live="polite">0</span></button>
        </div>
      </div>`;
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container footer-grid">
        <div class="footer-brand">
          <img src="assets/img/logo-white.png" alt="Tsa Ma Grootman" width="96" height="96">
          <p>Premium heavyweight tees for the modern South African grootman. Rooted in township culture, music and good company.</p>
          <div class="socials">
            <a href="${STORE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.ig}</a>
            <a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.wa}</a>
            <a href="mailto:${STORE.email}" aria-label="Email">${ICONS.mail}</a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <a href="shop.html">All tees</a>
          <a href="shop.html?c=logo">Logo collection</a>
          <a href="shop.html?c=music">Music collection</a>
        </div>
        <div>
          <h4>Help</h4>
          <a href="contact.html#orders">Orders &amp; delivery</a>
          <a href="contact.html#sizing">Size guide</a>
          <a href="contact.html#returns">Returns &amp; exchanges</a>
          <a href="contact.html">Contact us</a>
        </div>
        <div>
          <h4>The Brand</h4>
          <a href="about.html">Our story</a>
          <a href="about.html#sound">The soundscape</a>
          <a href="about.html#events">Events</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© ${new Date().getFullYear()} Tsa Ma Grootman. Made in South Africa.</span>
        <span>Your move. Your statement.</span>
      </div>`;
  }

  // Drawer, search, toast
  document.body.insertAdjacentHTML('beforeend', `
    <div class="scrim" data-close></div>
    <aside class="drawer" id="cart-drawer" aria-label="Shopping cart" aria-hidden="true">
      <div class="drawer-head"><h3>Your Cart</h3><button class="icon-btn" data-close aria-label="Close cart">${ICONS.close}</button></div>
      <div class="drawer-body" id="cart-lines"></div>
      <div class="drawer-foot">
        <div class="row"><span>Subtotal</span><strong id="cart-total">R 0</strong></div>
        <p class="muted small">Delivery: free nationwide. VAT included.</p>
        <a href="checkout.html" class="btn btn-dark btn-block" id="checkout-btn">Checkout ${ICONS.arrow}</a>
      </div>
    </aside>
    <div class="search-panel" id="search-panel" aria-hidden="true">
      <div class="container">
        <div class="search-bar">
          ${ICONS.search}
          <input type="search" id="search-input" placeholder="Search tees — e.g. turntable, black, cassette" aria-label="Search products">
          <button class="icon-btn" data-close aria-label="Close search">${ICONS.close}</button>
        </div>
        <div class="search-results" id="search-results"></div>
      </div>
    </div>
    <div class="toast" id="toast" role="status"></div>`);

  // events
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openPanel('cart'); }
    else if (e.target.closest('[data-open-search]')) { e.preventDefault(); openPanel('search'); }
    else if (e.target.closest('[data-close]')) closePanels();
    const q = e.target.closest('[data-qty]');
    if (q) Cart.setQty(+q.dataset.idx, +q.dataset.qty);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels(); });

  const toggle = document.querySelector('.nav-toggle');
  toggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });

  document.getElementById('search-input').addEventListener('input', (e) => renderSearch(e.target.value));

  // header shadow on scroll
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

function openPanel(which) {
  closePanels();
  document.body.classList.add(which === 'cart' ? 'cart-open' : 'search-open');
  const el = document.getElementById(which === 'cart' ? 'cart-drawer' : 'search-panel');
  el.setAttribute('aria-hidden', 'false');
  if (which === 'search') { renderSearch(''); setTimeout(() => document.getElementById('search-input').focus(), 50); }
}
function closePanels() {
  document.body.classList.remove('cart-open', 'search-open', 'nav-open');
  document.querySelectorAll('.drawer, .search-panel').forEach((el) => el.setAttribute('aria-hidden', 'true'));
}

function updateCount() {
  document.querySelectorAll('.cart-count').forEach((el) => { el.textContent = Cart.count(); });
}

function renderCart() {
  const wrap = document.getElementById('cart-lines');
  if (!wrap) return;
  const items = Cart.items();
  const btn = document.getElementById('checkout-btn');
  if (!items.length) {
    wrap.innerHTML = `<div class="empty"><p>Your cart is empty.</p><a href="shop.html" class="btn btn-outline">Shop the collection</a></div>`;
    btn?.classList.add('is-disabled');
  } else {
    btn?.classList.remove('is-disabled');
    wrap.innerHTML = items.map((l, i) => {
      const p = getProduct(l.id); if (!p) return '';
      return `<div class="line">
        <a href="product.html?id=${p.id}" class="line-img"><img src="${lineImage(l)}" alt="${p.name}"></a>
        <div class="line-info">
          <a href="product.html?id=${p.id}" class="line-name">${p.name}</a>
          <span class="muted small">${l.color} · Size ${l.size}</span>
          <div class="qty">
            <button data-qty="${l.qty - 1}" data-idx="${i}" aria-label="Decrease quantity">−</button>
            <span>${l.qty}</span>
            <button data-qty="${l.qty + 1}" data-idx="${i}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="line-price">${formatZAR(p.price * l.qty)}<button class="link-btn" data-qty="0" data-idx="${i}">Remove</button></div>
      </div>`;
    }).join('');
  }
  document.getElementById('cart-total').textContent = formatZAR(Cart.total());
}

function renderSearch(q) {
  const out = document.getElementById('search-results');
  const term = q.trim().toLowerCase();
  const list = PRODUCTS.filter((p) => {
    if (!term) return true;
    const hay = [p.name, p.short, p.description, p.collection, ...p.colors.map((c) => c.name)].join(' ').toLowerCase();
    return term.split(/\s+/).every((t) => hay.includes(t));
  });
  out.innerHTML = list.length
    ? list.map((p) => `<a class="search-item" href="product.html?id=${p.id}">
        <img src="${IMG(p.colors[0].images[0])}" alt=""><span><strong>${p.name}</strong><em>${formatZAR(p.price)}</em></span></a>`).join('')
    : `<p class="muted">No tees match “${q.replace(/</g, '&lt;')}”.</p>`;
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- product card ---------- */
function productCard(p) {
  const first = p.colors[0];
  const hover = p.colors[1]?.images[0] || first.images[1];
  return `<article class="card">
    <a href="product.html?id=${p.id}" class="card-media">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <img src="${IMG(first.images[0])}" alt="${p.name} in ${first.name}" loading="lazy">
      ${hover ? `<img class="card-hover" src="${IMG(hover)}" alt="" loading="lazy">` : ''}
    </a>
    <div class="card-body">
      <div>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="swatches" aria-label="Available colours">${p.colors.map((c) => `<span style="--c:${c.hex}" title="${c.name}"></span>`).join('')}</div>
      </div>
      <span class="price">${formatZAR(p.price)}</span>
    </div>
  </article>`;
}

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();
  renderCart();
  updateCount();
  document.querySelectorAll('[data-products]').forEach((el) => {
    const ids = el.dataset.products.split(',').map((s) => s.trim());
    el.innerHTML = ids.map(getProduct).filter(Boolean).map(productCard).join('');
  });
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = ICONS[el.dataset.icon] || ''; });
  initReveal();
});
