import { createClient } from '@supabase/supabase-js';

// The project URL and publishable key are public by design (they ship in the browser bundle and
// row-level security protects the data), so they're kept here as defaults for hosted builds.
// Override with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local or the host's env settings.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://udhwrdiyzkngqrwsadwf.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MA2FlVZh8-COLFCd3uQ3ew_R2yVIZdu';

export const supabase = createClient(url, key);

export const PRODUCT_BUCKET = 'product-images';
