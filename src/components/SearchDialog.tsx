import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEDIA_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';
function resolveImageUrl(url?: string) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
}

const suggestedSearches = [
  'Sandals', 'Suits', 'Shoes', 'Fragrances', 'Jewelry', 'Watches',
];

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { navigateTo } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery('');
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = (await api.getProducts({ search: trimmed })) as any;
        const items = Array.isArray(data) ? data : data?.results ?? [];
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
        setSearched(true);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleProductClick = (product: any) => {
    navigateTo('product', { productId: product.slug ?? String(product.id) });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
          onClick={handleClose}
        >
          <div className="mx-auto max-w-3xl px-4 pt-20">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for products, collections, or categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border-b-2 border-white/20 bg-transparent py-4 pl-12 pr-12 text-white placeholder-white/40 outline-none transition-colors focus:border-white"
                />
                {(query || isLoading) && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
                  >
                    {isLoading
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <X className="h-5 w-5" />
                    }
                  </button>
                )}
              </div>

              {/* Empty state — suggested searches */}
              {!query && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12"
                >
                  <p className="mb-4 text-xs tracking-wider text-white/60">SUGGESTED SEARCHES</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:border-white hover:bg-white/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {query && !isLoading && searched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  {results.length === 0 ? (
                    <p className="text-center text-sm text-white/60">
                      No products found for &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    <>
                      <p className="mb-4 text-xs tracking-wider text-white/60">
                        {results.length} RESULT{results.length !== 1 ? 'S' : ''} FOR &ldquo;{query.toUpperCase()}&rdquo;
                      </p>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {results.slice(0, 8).map((product: any) => {
                          const img = resolveImageUrl(product.image);
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="group text-left transition-all hover:opacity-80"
                            >
                              <div className="mb-2 aspect-square w-full overflow-hidden bg-white/10">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-white/20">
                                    <Search className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                              <p className="mb-0.5 text-xs font-medium text-white">{product.name}</p>
                              <p className="text-xs text-white/60">${Number(product.price).toFixed(2)}</p>
                            </button>
                          );
                        })}
                      </div>
                      {results.length > 8 && (
                        <p className="mt-4 text-center text-xs text-white/40">
                          Showing 8 of {results.length} results
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* Loading skeleton */}
              {isLoading && query && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="mb-2 aspect-square w-full bg-white/10" />
                      <div className="mb-1 h-3 w-3/4 rounded bg-white/10" />
                      <div className="h-3 w-1/2 rounded bg-white/10" />
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
