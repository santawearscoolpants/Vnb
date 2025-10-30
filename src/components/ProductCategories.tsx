import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { useRouter } from '../context/RouterContext';

const categories = [
  {
    id: 1,
    slug: 'suits',
    name: 'Suits',
    image: 'https://images.unsplash.com/photo-1553315164-49bb0615e0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdWl0fGVufDF8fHx8MTc2MTU1MjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Tailored Perfection'
  },
  {
    id: 2,
    slug: 'shoes',
    name: 'Classic Shoes',
    image: 'https://images.unsplash.com/photo-1650154281741-498255ad3513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGVhdGhlciUyMHNob2VzfGVufDF8fHx8MTc2MTU5NDg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Handcrafted Excellence'
  },
  {
    id: 3,
    slug: 'shirts',
    name: 'Shirts',
    image: 'https://images.unsplash.com/photo-1545921095-3e9b7ae8d85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNoaXJ0fGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Sophisticated Style'
  },
  {
    id: 4,
    slug: 'fragrances',
    name: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1615160460367-dcccd27e11ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lfGVufDF8fHx8MTc2MTU2ODMzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Signature Scents'
  },
  {
    id: 5,
    slug: 'jewelleries',
    name: 'Jewelleries',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5fGVufDF8fHx8MTc2MTQ4ODI5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Timeless Elegance'
  },
  {
    id: 6,
    slug: 'sandals',
    name: 'Sandals',
    image: 'https://images.unsplash.com/photo-1570653190404-6f1ccf9261f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYW5kYWxzfGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Summer Luxury'
  }
];

export function ProductCategories() {
  const { navigateTo } = useRouter();

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
          <p className="text-zinc-600">
            Curated pieces that define modern luxury
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} navigateTo={navigateTo} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
  navigateTo
}: {
  category: typeof categories[0];
  index: number;
  navigateTo: any;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => navigateTo('category', { categoryId: category.slug })}
    >
      {/* Image Container */}
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
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>

      {/* Text Below Image */}
      <div className="mt-4 text-center">
        <h3 className="text-black">{category.name}</h3>
        <p className="mt-1 text-sm text-zinc-500">Coming soon</p>
      </div>
    </motion.div>
  );
}