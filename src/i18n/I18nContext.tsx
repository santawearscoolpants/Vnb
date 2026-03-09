import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { translations, SUPPORTED_LANGUAGES } from './translations';
import type { Language } from './translations';

const LS_KEY = 'preferred_language';

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  } catch { /* noop */ }
  return 'en';
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    try { localStorage.setItem(LS_KEY, lang); } catch { /* noop */ }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let str = translations[language]?.[key] ?? translations.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return str;
    },
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
