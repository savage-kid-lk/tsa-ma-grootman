/* =========================================================
   TSA MA GROOTMAN — product catalogue
   Prices are in South African Rand (ZAR), VAT inclusive.
   Edit prices, names or colours here; every page updates.
   ========================================================= */

const STORE = {
  name: 'Tsa Ma Grootman',
  currency: 'ZAR',
  // TODO: replace with the client's real details
  email: 'orders@tsamagrootman.co.za',
  whatsapp: '27000000000', // international format, no "+" (e.g. 27821234567)
  instagram: 'https://instagram.com/',
  freeDeliveryNote: 'Free nationwide delivery on every order',
};

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const PRODUCTS = [
  {
    id: 'grootman-classic',
    name: 'The Grootman Classic',
    collection: 'logo',
    price: 595,
    badge: 'Essential',
    short: 'Clean chest-logo tee. The one you reach for every day.',
    description:
      'Our signature crest, printed small on the left chest, with the woven neck label inside. Understated on purpose — a grootman doesn\'t need to shout. Heavyweight 300 GSM cotton that keeps its shape wash after wash.',
    colors: [
      { name: 'White', hex: '#f4f4f2', images: ['classic-white.jpg', 'classic-white-lifestyle.jpg'] },
      { name: 'Black', hex: '#111111', images: ['classic-black.jpg', 'featured-folded.jpg'] },
    ],
  },
  {
    id: 'the-statement',
    name: 'The Statement',
    collection: 'logo',
    price: 695,
    badge: 'Bestseller',
    short: 'Full-front crest. Your move, your statement.',
    description:
      'The full Tsa Ma Grootman crest, front and centre. Bold, graphic and made to be seen at the braai, the gig or the Sunday session. Heavyweight 300 GSM cotton with a relaxed, structured fit.',
    colors: [
      { name: 'Black', hex: '#111111', images: ['statement-black.jpg'] },
      { name: 'White', hex: '#f4f4f2', images: ['statement-white.jpg'] },
    ],
  },
  {
    id: 'the-selector',
    name: 'The Selector',
    collection: 'music',
    price: 795,
    badge: 'Music',
    short: 'Life-size turntable print for the man behind the decks.',
    description:
      'A tribute to the selectors who soundtracked our lives — Deep House Sundays, Kwaito on the radio, Old School R&B at the after-party. Full-front turntable print with the crest on the chest.',
    colors: [
      { name: 'White', hex: '#f4f4f2', images: ['selector-white.jpg', 'lookbook-vinyl.jpg'] },
      { name: 'Black', hex: '#111111', images: ['selector-black.jpg', 'selector-black-folded.jpg'] },
      { name: 'Charcoal', hex: '#4a4a4a', images: ['selector-charcoal.jpg'] },
      { name: 'Bone', hex: '#e9e0cc', images: ['selector-bone.jpg'] },
    ],
  },
  {
    id: 'side-a',
    name: 'Side A',
    collection: 'music',
    price: 795,
    short: 'Turntable print with the crest on the record label.',
    description:
      'The Selector\'s smoother sibling. The Grootman crest spins on the centre label of the record — a detail for those who know. Printed on a warm bone-coloured heavyweight tee.',
    colors: [{ name: 'Bone', hex: '#e9e0cc', images: ['sidea-bone.jpg'] }],
  },
  {
    id: 'the-mixtape',
    name: 'The Mixtape',
    collection: 'music',
    price: 750,
    badge: 'New',
    short: 'Green-label cassette. Rewind it with a pencil.',
    description:
      'Before playlists, there were mixtapes. A full-colour cassette print with the Tsa Ma Grootman label — and yes, that\'s a pencil in the spool. Heavyweight 300 GSM black cotton.',
    colors: [{ name: 'Black', hex: '#111111', images: ['mixtape-black.jpg', 'mixtape-black-wall.jpg'] }],
  },
  {
    id: 'retro-tape',
    name: 'Retro Tape',
    collection: 'music',
    price: 750,
    short: 'Cream-label cassette with a vintage finish.',
    description:
      'Our cassette graphic in a muted cream-and-black colourway with a worn, vintage feel. For the man who still has a shoebox of tapes somewhere at home.',
    colors: [{ name: 'Black', hex: '#111111', images: ['retro-tape-black.jpg'] }],
  },
  {
    id: 'crate-digger',
    name: 'The Crate Digger',
    collection: 'music',
    price: 895,
    badge: 'Premium',
    short: 'Vinyl slipping out of its sleeve. Pure crate-digging energy.',
    description:
      'A record sliding out of its sleeve, with the Grootman face on the label. Our most detailed print, finished in warm cream and gold tones. Heavyweight 300 GSM cotton.',
    colors: [
      { name: 'Black', hex: '#111111', images: ['crate-black.jpg'] },
      { name: 'White', hex: '#f4f4f2', images: ['crate-white.jpg'] },
      { name: 'Sand', hex: '#d9c4a3', images: ['crate-sand.jpg'] },
    ],
  },
];

const IMG = (f) => `assets/img/${f}`;
const formatZAR = (n) =>
  'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/,/g, ' ');
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
