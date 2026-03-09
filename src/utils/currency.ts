export const BASE_CURRENCY = 'GHS';

export const SUPPORTED_CURRENCIES = ['GHS', 'USD', 'NGN', 'GBP', 'EUR', 'KES'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  GHS: 'GH₵ — Ghana Cedi',
  USD: '$ — US Dollar',
  NGN: '₦ — Nigerian Naira',
  GBP: '£ — British Pound',
  EUR: '€ — Euro',
  KES: 'KSh — Kenyan Shilling',
};

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  GH: 'GHS',
  NG: 'NGN',
  KE: 'KES',
  US: 'USD',
  GB: 'GBP',
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR',
  FR: 'EUR', DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR',
  LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
  PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',
};

const LOCALE_MAP: Record<CurrencyCode, string> = {
  GHS: 'en-GH',
  USD: 'en-US',
  NGN: 'en-NG',
  GBP: 'en-GB',
  EUR: 'de-DE',
  KES: 'en-KE',
};

const LS_KEY = 'preferred_currency';
const LS_RATES_KEY = 'exchange_rates';
const LS_RATES_TS_KEY = 'exchange_rates_ts';
const RATES_TTL_MS = 60 * 60 * 1000; // 1 hour

// --------------- localStorage helpers ---------------

export function getUserCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && SUPPORTED_CURRENCIES.includes(stored as CurrencyCode)) {
      return stored as CurrencyCode;
    }
  } catch { /* SSR / privacy */ }
  return BASE_CURRENCY;
}

export function setUserCurrency(code: CurrencyCode) {
  try { localStorage.setItem(LS_KEY, code); } catch { /* noop */ }
}

export function hasUserCurrencyChoice(): boolean {
  try { return localStorage.getItem(LS_KEY) !== null; } catch { return false; }
}

// --------------- Exchange rates ---------------

export type RateMap = Record<string, number>;

function getCachedRates(): RateMap | null {
  try {
    const ts = Number(localStorage.getItem(LS_RATES_TS_KEY) || 0);
    if (Date.now() - ts > RATES_TTL_MS) return null;
    const raw = localStorage.getItem(LS_RATES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCachedRates(rates: RateMap) {
  try {
    localStorage.setItem(LS_RATES_KEY, JSON.stringify(rates));
    localStorage.setItem(LS_RATES_TS_KEY, String(Date.now()));
  } catch { /* noop */ }
}

export async function fetchExchangeRates(): Promise<RateMap> {
  const cached = getCachedRates();
  if (cached) return cached;

  const targets = SUPPORTED_CURRENCIES.filter(c => c !== BASE_CURRENCY).join(',');

  // Try primary API
  try {
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${BASE_CURRENCY}&symbols=${targets}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.rates && typeof data.rates === 'object') {
        const rates: RateMap = { [BASE_CURRENCY]: 1, ...data.rates };
        setCachedRates(rates);
        return rates;
      }
    }
  } catch { /* fall through */ }

  // Fallback API
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.rates) {
        const rates: RateMap = { [BASE_CURRENCY]: 1 };
        for (const c of SUPPORTED_CURRENCIES) {
          if (data.rates[c]) rates[c] = data.rates[c];
        }
        setCachedRates(rates);
        return rates;
      }
    }
  } catch { /* fall through */ }

  // Hardcoded fallback so the UI never breaks
  const fallback: RateMap = {
    GHS: 1,
    USD: 0.065,
    NGN: 100,
    GBP: 0.052,
    EUR: 0.060,
    KES: 10.5,
  };
  return fallback;
}

// --------------- Conversion & formatting ---------------

export function convertAmount(
  amountInBase: number | string,
  targetCurrency: CurrencyCode,
  rates: RateMap,
): number {
  const value = Number(amountInBase || 0);
  if (targetCurrency === BASE_CURRENCY) return value;
  const rate = rates[targetCurrency];
  if (!rate) return value;
  return value * rate;
}

export function formatMoney(
  amount: number | string,
  currency: CurrencyCode = BASE_CURRENCY,
  rates?: RateMap,
): string {
  let value = Number(amount || 0);
  if (rates && currency !== BASE_CURRENCY) {
    value = convertAmount(value, currency, rates);
  }
  const locale = LOCALE_MAP[currency] || 'en-GH';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function getCurrencyCode(): CurrencyCode {
  return getUserCurrency();
}

// --------------- Geo-detection ---------------

export async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return data?.country_code ?? null;
    }
  } catch { /* noop */ }

  try {
    const res = await fetch('https://ipinfo.io/json?token=', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return data?.country ?? null;
    }
  } catch { /* noop */ }

  return null;
}
