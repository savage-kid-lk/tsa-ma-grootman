// PayFast helpers shared by create-payment and payfast-itn.
//
// Sandbox mode (default): PayFast's published PUBLIC sandbox test merchant 10004002 (passphrase "payfast"),
// listed in PayFast's support article on merchant_id/merchant_key errors. The older shared merchant 10000100
// no longer completes checkouts on PayFast's sandbox (Nov 2026). Override with PAYFAST_SANDBOX_MERCHANT_ID /
// _MERCHANT_KEY / _PASSPHRASE for your own sandbox account.
// Live mode (secret PAYFAST_SANDBOX=false): uses PAYFAST_MERCHANT_ID / PAYFAST_MERCHANT_KEY / PAYFAST_PASSPHRASE.
import { crypto } from 'jsr:@std/crypto@1';
import { encodeHex } from 'jsr:@std/encoding@1/hex';

const env = (k: string) => (Deno.env.get(k) ?? '').trim();
const sandbox = env('PAYFAST_SANDBOX') !== 'false';

export const PAYFAST = sandbox
  ? {
      sandbox,
      merchantId: env('PAYFAST_SANDBOX_MERCHANT_ID') || '10004002',
      merchantKey: env('PAYFAST_SANDBOX_MERCHANT_KEY') || 'q1cd2rdny4a53',
      passphrase: env('PAYFAST_SANDBOX_MERCHANT_ID') ? env('PAYFAST_SANDBOX_PASSPHRASE') : 'payfast',
    }
  : {
      sandbox,
      merchantId: env('PAYFAST_MERCHANT_ID'),
      merchantKey: env('PAYFAST_MERCHANT_KEY'),
      passphrase: env('PAYFAST_PASSPHRASE'),
    };

export const pfHost = () => (PAYFAST.sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za');

/** PHP urlencode(): spaces → '+', uppercase hex, and encodes !'()*~ too. */
export function phpUrlencode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

export async function md5(s: string): Promise<string> {
  return encodeHex(await crypto.subtle.digest('MD5', new TextEncoder().encode(s)));
}

/** Builds "k=v&k=v" from ordered pairs. `skipBlank` drops empty values (checkout form rule). */
export function paramString(pairs: [string, string][], skipBlank: boolean): string {
  return pairs
    .filter(([k, v]) => k !== 'signature' && (!skipBlank || v.trim() !== ''))
    .map(([k, v]) => `${k}=${phpUrlencode(v.trim())}`)
    .join('&');
}

export async function signature(pairs: [string, string][], skipBlank: boolean): Promise<string> {
  let s = paramString(pairs, skipBlank);
  if (PAYFAST.passphrase) s += `&passphrase=${phpUrlencode(PAYFAST.passphrase.trim())}`;
  return md5(s);
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const serviceKey = () =>
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
