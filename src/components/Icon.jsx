const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
  cart: <><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.3h9.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6" /><circle cx="9.5" cy="20.5" r="1.3" /><circle cx="17.5" cy="20.5" r="1.3" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  arrow: <path d="M4 12h15m-5-6 6 6-6 6" />,
  ig: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></>,
  wa: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
};

const LARGE = {
  crown: <><path d="M6 16l9 9 9-15 9 15 9-9-4 22H10z" /><path d="M10 42h28" /></>,
  truck: <><path d="M3 12h26v22H3zM29 20h9l7 7v7H29z" /><circle cx="12" cy="36" r="4" /><circle cx="37" cy="36" r="4" /></>,
  card: <><rect x="4" y="10" width="40" height="28" rx="3" /><path d="M4 18h40M10 30h10" /></>,
  music: <><path d="M18 36V10l24-5v26" /><circle cx="12" cy="36" r="6" /><circle cx="36" cy="31" r="6" /><path d="M18 17l24-5" /></>,
};

export default function Icon({ name }) {
  if (LARGE[name]) return <svg viewBox="0 0 48 48" aria-hidden="true">{LARGE[name]}</svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true">{PATHS[name]}</svg>;
}
