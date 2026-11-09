# Tsa Ma Grootman — website

E-commerce store built with **Vite + React 19 + React Router 7**, **Supabase** (database, auth, storage, edge functions) and **PayFast** checkout.

```bash
npm install      # first time only
npm run dev      # development server → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

## Setup
1. `cp .env.example .env.local` and fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
2. Database: run `supabase/migrations/*.sql`, then `supabase/seed.sql` (original catalogue).
3. Edge functions: deploy `create-payment` (JWT verified) and `payfast-itn` (**no** JWT verification — PayFast calls it).
   `supabase functions deploy create-payment && supabase functions deploy payfast-itn --no-verify-jwt`
4. Auth → URL configuration: set Site URL to your site (e.g. `http://localhost:5173`) and add `http://localhost:5173/**` as a redirect URL.
5. Make yourself an admin: register on the site, then in the SQL editor run
   `update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');`

## Structure
```
supabase/migrations/       schema, row-level security, storage bucket
supabase/seed.sql          the original 7 tees
supabase/functions/        create-payment (prices cart server-side, signs PayFast form)
                           payfast-itn (verifies PayFast notifications, marks orders paid)
src/lib/supabase.js        Supabase client
src/context/               AuthContext (session + profile/role), CatalogContext (products), StoreContext (cart)
src/pages/                 storefront: Home, Shop, Product (multi-image gallery), Checkout, CheckoutResult, About, Contact
src/pages/account/         sign in / register / reset password, My account (orders)
src/pages/admin/           /admin dashboard: overview (incl. low stock), products (add/edit/delete, images, stock), orders, store info
```

## Data model
`products` (slug id, price, sizes, visible/featured) → `product_colors` → `product_images`
(an image belongs to one colour, or to all colours when `color_id` is null; images live in the public
`product-images` storage bucket). Stock: each product has `unlimited_stock`, `stock_quantity` and `low_stock_threshold`; the shop shows
"Only N left" / "Sold out", `create-payment` refuses to oversell, and `payfast-itn` subtracts stock (via
`apply_order_stock`) when an order is paid. `site_content` holds the size guide and returns policy, edited at
`/admin/content`. `orders` + `order_items` are written only by the `create-payment`
function; customers can read their own orders, admins read all and change status.

## Payments — PayFast
Checkout requires sign-in. `create-payment` re-prices the cart from the database, creates a `pending`
order and returns signed fields; the browser posts them to PayFast. PayFast then calls `payfast-itn`, which
checks the signature, validates the data with PayFast's server and compares the amount before marking the
order `paid`.

Defaults are PayFast's **sandbox** test merchant (10000100). To use your own sandbox or go live, set function
secrets: `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`, and `PAYFAST_SANDBOX=false` for live.
Sandbox test buyer: log in on the PayFast sandbox page with the test wallet it offers — no real money moves.

## Deploying
Upload the `dist/` folder. Because the site uses client-side routing, the host must serve `index.html`
for unknown paths (SPA fallback):
- **Netlify:** add `public/_redirects` containing `/*  /index.html  200`
- **Vercel / Firebase Hosting:** add a rewrite of `**` → `/index.html`
- **Apache/cPanel:** an `.htaccess` rewrite to `index.html`
