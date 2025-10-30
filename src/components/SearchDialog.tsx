import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
  { 
    name: 'Classic Leather Sandals', 
    category: 'Sandals',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400'
  },
  { 
    name: 'Italian Wool Suit', 
    category: 'Suits',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'
  },
  { 
    name: 'Signature Eau de Parfum', 
    category: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'
  },
  { 
    name: 'Diamond Cufflinks', 
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
  }
];

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { navigateTo } = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would filter and show results
  };

  const handleClear = () => {
    setSearchQuery('');
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
                  onClick={handleClear}
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
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {popularProducts.map((product, index) => (
                        <button
                          key={index}
                          onClick={() => handleProductClick(product.category)}
                          className="group text-left transition-all hover:opacity-80"
                        >
                          <div className="mb-2 aspect-square w-full overflow-hidden bg-white/10">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <p className="mb-1 text-xs text-white">{product.name}</p>
                          <p className="text-xs text-white/60">{product.category}</p>
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