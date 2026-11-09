import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase.js';

export const CONTENT_DEFAULTS = {
  size_guide: {
    intro: 'Our tees have a relaxed, structured fit. Measurements are chest width (armpit to armpit) and body length, in centimetres.',
    rows: [
      { size: 'S', chest: '51', length: '70' }, { size: 'M', chest: '54', length: '72' }, { size: 'L', chest: '57', length: '74' },
      { size: 'XL', chest: '60', length: '76' }, { size: '2XL', chest: '63', length: '78' }, { size: '3XL', chest: '66', length: '80' },
    ],
  },
  returns: {
    body: "Unworn, unwashed items can be exchanged or returned within 14 days of delivery. Contact us with your order number and we'll arrange it. Sizing exchanges are on us.",
  },
};

/** Editable store copy from the site_content table, with built-in defaults while loading. */
export default function useSiteContent(key) {
  const [data, setData] = useState(CONTENT_DEFAULTS[key]);
  useEffect(() => {
    let live = true;
    supabase.from('site_content').select('data').eq('key', key).maybeSingle()
      .then(({ data: row }) => { if (live && row?.data) setData({ ...CONTENT_DEFAULTS[key], ...row.data }); });
    return () => { live = false; };
  }, [key]);
  return data;
}

/** Split text into paragraphs on blank lines. */
export const paragraphs = (text = '') => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
