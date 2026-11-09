/* =========================================================
   TSA MA GROOTMAN — store settings & helpers
   Products now live in Supabase (tables: products, product_colors,
   product_images) and are managed from /admin.
   ========================================================= */

export const STORE = {
  name: 'Tsa Ma Grootman',
  currency: 'ZAR',
  // TODO: replace with the client's real details
  email: 'orders@tsamagrootman.co.za',
  whatsapp: '27000000000', // international format, no "+" (e.g. 27821234567)
  instagram: 'https://instagram.com/',
  freeDeliveryNote: 'Free nationwide delivery on every order',
};

export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];

export const formatZAR = (n) =>
  'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 }).replace(/[,  ]/g, ' ');

export const collectionLabel = (c) => (c ? c.charAt(0).toUpperCase() + c.slice(1) : '');

/** Supabase row (with nested colours & images) → the shape the storefront uses. */
export function mapProduct(row) {
  const images = [...(row.product_images || [])].sort((a, b) => a.position - b.position);
  const shared = images.filter((i) => !i.color_id);
  const colors = [...(row.product_colors || [])]
    .sort((a, b) => a.position - b.position)
    .map((c) => {
      const own = images.filter((i) => i.color_id === c.id);
      return { id: c.id, name: c.name, hex: c.hex, images: [...own, ...shared].map((i) => ({ url: i.url, alt: i.alt })) };
    });
  return {
    id: row.id,
    name: row.name,
    collection: row.collection,
    price: Number(row.price),
    badge: row.badge,
    short: row.short || '',
    description: row.description || '',
    sizes: row.sizes?.length ? row.sizes : SIZES,
    active: row.active,
    featured: row.featured,
    sortOrder: row.sort_order,
    unlimitedStock: row.unlimited_stock ?? true,
    stock: row.stock_quantity ?? 0,
    lowStockThreshold: row.low_stock_threshold ?? 5,
    colors,
    images: images.map((i) => ({ url: i.url, alt: i.alt })),
  };
}

export const PRODUCT_SELECT = '*, product_colors(*), product_images(*)';

/** Stock state for display: 'unlimited' | 'in' | 'low' | 'out'. */
export function stockStatus(p) {
  if (!p || p.unlimitedStock) return 'unlimited';
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.lowStockThreshold) return 'low';
  return 'in';
}

/** Most of a product a shopper can still add, given what's already in the cart. */
export function maxAddable(p, inCart = 0) {
  return p.unlimitedStock ? 20 : Math.max(0, Math.min(20, p.stock) - inCart);
}

/** First image for a colour, falling back to any product image. */
export function colorImage(product, colorName) {
  const c = product?.colors.find((x) => x.name === colorName) || product?.colors[0];
  return c?.images[0]?.url || product?.images[0]?.url || '/img/logo-black.png';
}
