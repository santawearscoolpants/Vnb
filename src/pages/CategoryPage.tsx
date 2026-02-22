import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../context/RouterContext';
import { Heart, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .replace('/api', '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
}

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  in_stock: boolean;
}

interface PaginatedProducts {
  results: ApiProduct[];
  count: number;
}

export function CategoryPage() {
  const { goBack, categoryId, navigateTo } = useRouter();

  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setError('No category specified.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([
      api.getCategory(categoryId),
      api.getProducts({ category__slug: categoryId }),
    ])
      .then(([cat, prods]) => {
        setCategory(cat as ApiCategory);
        setProducts(((prods as PaginatedProducts).results ?? []) as ApiProduct[]);
      })
      .catch(() => setError('This category could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="border-b border-zinc-200 px-4 py-4 md:px-8">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mb-16 text-center space-y-3">
            <div className="mx-auto h-3 w-32 animate-pulse rounded bg-zinc-100" />
            <div className="mx-auto h-8 w-48 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="h-[250px] animate-pulse rounded bg-zinc-100 md:h-[350px]" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="mx-auto max-w-7xl px-4 py-32 text-center md:px-8">
          <p className="mb-6 text-sm text-zinc-600">{error}</p>
          <button onClick={goBack} className="text-sm underline hover:text-zinc-600">
            Go back
          </button>
        </div>
      )}

      {/* Category content */}
      {!isLoading && category && (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            {category.description && (
              <p className="mb-2 text-xs tracking-[0.2em] text-zinc-500">
                {category.description}
              </p>
            )}
            <h1>{category.name}</h1>
          </motion.div>

          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <p className="text-sm text-zinc-500">No products available in this category yet.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  navigateTo={navigateTo}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  index,
  navigateTo,
}: {
  product: ApiProduct;
  index: number;
  navigateTo: (page: string, params?: Record<string, string>) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.5) }}
      className="group cursor-pointer"
      onClick={() => navigateTo('product', { productId: product.slug })}
    >
      <div
        className="relative h-[250px] overflow-hidden bg-zinc-100 md:h-[350px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute right-2 top-2 z-10 rounded-full border border-black/20 bg-white/80 p-1.5 backdrop-blur-sm transition-all hover:bg-white md:right-4 md:top-4 md:p-2"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-3 w-3 md:h-4 md:w-4 ${isFavorited ? 'fill-black stroke-black' : 'stroke-black'}`}
          />
        </button>

        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full w-full"
        >
          <ImageWithFallback
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </motion.div>

        {!product.in_stock && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center text-xs text-white">
            Out of stock
          </div>
        )}
      </div>

      <div className="mt-4 text-left">
        <h4 className="mb-1 text-black">{product.name}</h4>
        <p className="text-xs text-zinc-600">
          ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </motion.div>
  );
}
