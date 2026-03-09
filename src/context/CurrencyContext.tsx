import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  BASE_CURRENCY,
  getUserCurrency,
  setUserCurrency,
  hasUserCurrencyChoice,
  fetchExchangeRates,
  detectCountry,
  convertAmount,
  formatMoney as rawFormat,
  COUNTRY_CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
} from '../utils/currency';
import type { CurrencyCode, RateMap } from '../utils/currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  rates: RateMap;
  ratesLoaded: boolean;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInGHS: number | string) => string;
  convertPrice: (amountInGHS: number | string) => number;
  /** Non-null when a suggestion is pending (user hasn't chosen yet) */
  suggestedCurrency: CurrencyCode | null;
  detectedCountry: string | null;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getUserCurrency);
  const [rates, setRates] = useState<RateMap>({ [BASE_CURRENCY]: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [suggestedCurrency, setSuggestedCurrency] = useState<CurrencyCode | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const initRan = useRef(false);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    setUserCurrency(code);
    setSuggestedCurrency(null);
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (suggestedCurrency) {
      setCurrency(suggestedCurrency);
    }
  }, [suggestedCurrency, setCurrency]);

  const dismissSuggestion = useCallback(() => {
    setSuggestedCurrency(null);
    setUserCurrency(currency);
  }, [currency]);

  // Load exchange rates (async, non-blocking)
  useEffect(() => {
    let cancelled = false;
    fetchExchangeRates().then((r) => {
      if (!cancelled) {
        setRates(r);
        setRatesLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Geo-detect once on mount — only if user hasn't chosen a currency yet
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    if (hasUserCurrencyChoice()) return;

    const timer = setTimeout(() => {
      detectCountry().then((countryCode) => {
        if (!countryCode) return;
        setDetectedCountry(countryCode);
        const mapped = COUNTRY_CURRENCY_MAP[countryCode];
        if (mapped && mapped !== BASE_CURRENCY && SUPPORTED_CURRENCIES.includes(mapped)) {
          setSuggestedCurrency(mapped);
        } else {
          setUserCurrency(BASE_CURRENCY);
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = useCallback(
    (amountInGHS: number | string) => rawFormat(amountInGHS, currency, rates),
    [currency, rates],
  );

  const convertPrice = useCallback(
    (amountInGHS: number | string) => convertAmount(amountInGHS, currency, rates),
    [currency, rates],
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        rates,
        ratesLoaded,
        setCurrency,
        formatPrice,
        convertPrice,
        suggestedCurrency,
        detectedCountry,
        acceptSuggestion,
        dismissSuggestion,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
