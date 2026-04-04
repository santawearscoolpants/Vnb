import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type WishlistContextType = {
  items: string[];
  has: (key: string | number) => boolean;
  toggle: (key: string | number) => void;
  clear: () => void;
};

const STORAGE_KEY = 'vnb_wishlist_items';
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function normalizeKey(key: string | number) {
  return String(key || '').trim().toLowerCase();
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed.map((item) => normalizeKey(item)).filter(Boolean));
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors.
    }
  }, [items]);

  const has = (key: string | number) => {
    const normalized = normalizeKey(key);
    if (!normalized) return false;
    return items.includes(normalized);
  };

  const toggle = (key: string | number) => {
    const normalized = normalizeKey(key);
    if (!normalized) return;
    setItems((prev) => (prev.includes(normalized)
      ? prev.filter((entry) => entry !== normalized)
      : [...prev, normalized]));
  };

  const clear = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, has, toggle, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
