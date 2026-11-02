# Tsa Ma Grootman — website

Static e-commerce site (HTML/CSS/vanilla JS, no build step).

Open `index.html` in a browser, or serve the folder:  `python3 -m http.server 8000`

## Pages
index · shop (filter/sort) · product (`product.html?id=…`) · about · contact (FAQ, size guide) · checkout

## Edit before going live — `assets/js/products.js`
- `STORE.email`, `STORE.whatsapp`, `STORE.instagram` — **placeholders**, replace with the client's real details.
- `PRODUCTS` — names, prices (ZAR, VAT incl.), colours and images. Every page updates from this file.

## Placeholder prices (client did not supply a price list)
| Tee | Price |
|---|---|
| The Grootman Classic (chest logo) | R595 |
| The Statement (full crest) | R695 |
| The Mixtape / Retro Tape | R750 |
| The Selector / Side A (turntable) | R795 |
| The Crate Digger (vinyl sleeve) | R895 — taken from the client's own artwork ("R895 including delivery") |

## Checkout
No payment gateway is connected yet. Placing an order shows an order number and lets the customer
send the order to the store via WhatsApp or email. To take real payments, connect PayFast, Yoco or
Ozow (all South African) on the checkout page.

## Images
`assets/img/` — each product cropped out of the client's composite mock-ups and padded to 3:4.
