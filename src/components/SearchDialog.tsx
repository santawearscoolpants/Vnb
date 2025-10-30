import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '../context/RouterContext';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedSearches = [
  'Luxury Sandals',
  'Designer Suits',
  'Classic Shoes',
  'Premium Fragrances',
  'Gold Jewelry',
  'Silk Shirts'
];

const popularProducts = [
  { name: 'Classic Leather Sandals', category: 'Sandals' },
  { name: 'Italian Wool Suit', category: 'Suits' },
  { name: 'Signature Eau de Parfum', category: 'Fragrances' },
  { name: 'Diamond Cufflinks', category: 'Jewelry' }
];

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { navigateTo } = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would filter and show results
  };

  const handleProductClick = (category: string) => {
    navigateTo('category', { categoryId: category.toLowerCase() });
    onClose();
    setSearchQuery('');
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
          onClick={onClose}
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
                  type="text"
                  placeholder="Search for products, collections, or categories..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full border-b-2 border-white/20 bg-transparent py-4 pl-12 pr-12 text-white placeholder-white/40 outline-none transition-colors focus:border-white"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Suggestions */}
              {!searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12 space-y-8"
                >
                  {/* Suggested Searches */}
                  <div>
                    <p className="mb-4 text-xs tracking-wider text-white/60">
                      SUGGESTED SEARCHES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:border-white hover:bg-white/10"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Products */}
                  <div>
                    <p className="mb-4 text-xs tracking-wider text-white/60">
                      POPULAR PRODUCTS
                    </p>
                    <div className="space-y-2">
                      {popularProducts.map((product, index) => (
                        <button
                          key={index}
                          onClick={() => handleProductClick(product.category)}
                          className="flex w-full items-center justify-between border-b border-white/10 py-3 text-left transition-colors hover:border-white/30"
                        >
                          <span className="text-white">{product.name}</span>
                          <span className="text-sm text-white/60">
                            {product.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Search Results (when typing) */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  <p className="text-center text-white/60">
                    Searching for "{searchQuery}"...
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
