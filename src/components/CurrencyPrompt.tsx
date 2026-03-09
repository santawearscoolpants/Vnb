import { motion, AnimatePresence } from 'motion/react';
import { Globe, X } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCY_LABELS, COUNTRY_CURRENCY_MAP } from '../utils/currency';
import type { CurrencyCode } from '../utils/currency';

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  KE: 'Kenya',
  US: 'the United States',
  GB: 'the United Kingdom',
  AT: 'Austria', BE: 'Belgium', CY: 'Cyprus', EE: 'Estonia', FI: 'Finland',
  FR: 'France', DE: 'Germany', GR: 'Greece', IE: 'Ireland', IT: 'Italy',
  LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'the Netherlands',
  PT: 'Portugal', SK: 'Slovakia', SI: 'Slovenia', ES: 'Spain',
};

function currencySymbol(code: CurrencyCode) {
  return CURRENCY_LABELS[code]?.split(' — ')[0]?.trim() ?? code;
}

export function CurrencyPrompt() {
  const { suggestedCurrency, detectedCountry, acceptSuggestion, dismissSuggestion } = useCurrency();

  if (!suggestedCurrency || !detectedCountry) return null;

  const mapped = COUNTRY_CURRENCY_MAP[detectedCountry];
  if (!mapped) return null;

  const countryName = COUNTRY_NAMES[detectedCountry] ?? detectedCountry;
  const symbol = currencySymbol(suggestedCurrency);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
      >
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
          <button
            onClick={dismissSuggestion}
            className="absolute right-3 top-3 text-zinc-400 hover:text-black"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
              <Globe className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-black">
                Visiting from {countryName}?
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Switch prices to {symbol} ({suggestedCurrency}) for a localised experience.
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={acceptSuggestion}
                  className="rounded-sm bg-black px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                >
                  Switch to {symbol}
                </button>
                <button
                  onClick={dismissSuggestion}
                  className="rounded-sm border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Keep GH₵
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
