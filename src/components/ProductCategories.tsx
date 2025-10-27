import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

const categories = [
  {
    id: 1,
    name: 'Suits',
    image: 'https://images.unsplash.com/photo-1553315164-49bb0615e0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdWl0fGVufDF8fHx8MTc2MTU1MjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Tailored Perfection'
  },
  {
    id: 2,
    name: 'Classic Shoes',
    image: 'https://images.unsplash.com/photo-1650154281741-498255ad3513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGVhdGhlciUyMHNob2VzfGVufDF8fHx8MTc2MTU5NDg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Handcrafted Excellence'
  },
  {
    id: 3,
    name: 'Shirts',
    image: 'https://images.unsplash.com/photo-1545921095-3e9b7ae8d85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNoaXJ0fGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Sophisticated Style'
  },
  {
    id: 4,
    name: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1615160460367-dcccd27e11ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lfGVufDF8fHx8MTc2MTU2ODMzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Signature Scents'
  },
  {
    id: 5,
    name: 'Jewelleries',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5fGVufDF8fHx8MTc2MTQ4ODI5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Timeless Elegance'
  },
  {
    id: 6,
    name: 'Sandals',
    image: 'https://images.unsplash.com/photo-1570653190404-6f1ccf9261f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYW5kYWxzfGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Summer Luxury'
  }
];

export function ProductCategories() {
  return (
    <section className="bg-zinc-50 px-4 py-24 md:px-8">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, index }: { category: typeof categories[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-[400px] cursor-pointer overflow-hidden rounded-sm bg-black"
    >
      {/* Image */}
      <motion.div
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full w-full"
      >
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover opacity-80"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <motion.div
          initial={{ opacity: 0.7 }}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        >
          <p className="mb-2 text-sm tracking-[0.2em] text-white/80">
            {category.description}
          </p>
          <h3 className="mb-4 text-white">{category.name}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-white"
        >
          Shop Now →
        </motion.div>
      </div>
    </motion.div>
  );
}
