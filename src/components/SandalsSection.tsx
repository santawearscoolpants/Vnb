import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';

const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
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
}

export function SandalsSection() {
  const { navigateTo } = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getFeaturedProducts()
      .then((data) => setProducts(((data as PaginatedProducts).results ?? (data as ApiProduct[])) as ApiProduct[]))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Hide section entirely if loading finished and no featured products exist
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="bg-white px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-xs tracking-[0.2em] text-zinc-500">NEW</p>
          <h2 className="mb-8 text-black">Featured Collection</h2>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-[250px] animate-pulse rounded bg-zinc-100 md:h-[350px]" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
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

        {!isLoading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 flex justify-center gap-4"
          >
            <button
              onClick={() => navigateTo('category', { categoryId: 'women' })}
              className="border border-black bg-transparent px-8 py-3 text-sm transition-colors hover:bg-black hover:text-white"
            >
              Shop Women's
            </button>
            <button
              onClick={() => navigateTo('category', { categoryId: 'men' })}
              className="border border-black bg-transparent px-8 py-3 text-sm transition-colors hover:bg-black hover:text-white"
            >
              Shop Men's
            </button>
          </motion.div>
        )}
      </div>
    </section>
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
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
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2 top-2 z-10 rounded-full border border-black/20 bg-white/80 p-1.5 backdrop-blur-sm transition-all hover:bg-white md:right-4 md:top-4 md:p-2"
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
