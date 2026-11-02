# Tsa Ma Grootman — website

E-commerce site built with **Vite + React 19 + React Router 7**.

```bash
npm install      # first time only
npm run dev      # development server → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

## Structure
```
index.html                 Vite entry (fonts, meta tags)
public/img/                product photos (cropped from the client's mock-ups), logos
src/main.jsx               app bootstrap (router + store provider)
src/App.jsx                routes: /  /shop  /product/:id  /about  /contact  /checkout
src/data/products.js       ← catalogue, prices, store contact details
src/context/StoreContext.jsx  cart (saved in localStorage), panels, toast
src/components/            Header, Footer, CartDrawer, SearchPanel, ProductCard, Layout, Icon, Reveal
src/pages/                 Home, Shop, Product, About, Contact, Checkout
src/styles/style.css       all styling
```

## Edit before going live — `src/data/products.js`
- `STORE.email`, `STORE.whatsapp`, `STORE.instagram` are **placeholders**; replace with the client's real details.
- `PRODUCTS`: names, prices (ZAR, VAT incl.), colours and images.

## Placeholder prices (client did not supply a price list)
| Tee | Price |
|---|---|
| The Grootman Classic (chest logo) | R595 |
| The Statement (full crest) | R695 |
| The Mixtape / Retro Tape | R750 |
| The Selector / Side A (turntable) | R795 |
| The Crate Digger (vinyl sleeve) | R895, from the client's own artwork ("R895 including delivery") |

## Checkout
No payment gateway is connected yet. Placing an order shows an order number and lets the customer send the
order via WhatsApp or email. To take real payments, connect PayFast, Yoco or Ozow in `src/pages/Checkout.jsx`.

## Deploying
Upload the `dist/` folder. Because the site uses client-side routing, the host must serve `index.html`
for unknown paths (SPA fallback):
- **Netlify:** add `public/_redirects` containing `/*  /index.html  200`
- **Vercel / Firebase Hosting:** add a rewrite of `**` → `/index.html`
- **Apache/cPanel:** an `.htaccess` rewrite to `index.html`
