import { useEffect } from 'react';

const BASE = 'Tsa Ma Grootman';

/** Sets document.title (and optionally the meta description) for the current page. */
export default function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Premium South African Lifestyle Tees`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
