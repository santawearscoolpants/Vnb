import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';

const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');

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
  product_count: number;
}

interface PaginatedCategories {
  results: ApiCategory[];
}

export function ProductCategories() {
  const { navigateTo } = useRouter();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then((data) => setCategories(((data as PaginatedCategories).results ?? []) as ApiCategory[]))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="collection" className="bg-zinc-50 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-black">Explore Our Collections</h2>
          <p className="text-zinc-600">Curated pieces that define modern luxury</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="h-[250px] animate-pulse rounded bg-zinc-200 md:h-[350px]" />
                <div className="mt-4 space-y-2 text-center">
                  <div className="mx-auto h-5 w-24 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center text-sm text-zinc-400"
          >
            Collections coming soon.
          </motion.p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                navigateTo={navigateTo}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
  navigateTo,
}: {
  category: ApiCategory;
  index: number;
  navigateTo: (page: string, params?: Record<string, string>) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
      className="group cursor-pointer"
      onClick={() => navigateTo('category', { categoryId: category.slug })}
    >
      <div
        className="relative h-[250px] overflow-hidden bg-zinc-100 md:h-[350px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full w-full"
        >
          <ImageWithFallback
            src={resolveImageUrl(category.image)}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-black">{category.name}</h3>
        {category.description && (
          <p className="mt-1 text-sm text-zinc-500">{category.description}</p>
        )}
      </div>
    </motion.div>
  );
}
