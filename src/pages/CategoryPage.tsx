import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../context/RouterContext';
import { Heart, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

const categoryProducts: Record<string, any> = {
  suits: {
    name: 'Suits',
    description: 'Tailored Perfection',
    products: [
      { id: '201', name: 'Classic Navy Suit', price: '$2,450', image: 'https://images.unsplash.com/photo-1553315164-49bb0615e0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdWl0fGVufDF8fHx8MTc2MTU1MjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '202', name: 'Charcoal Three-Piece', price: '$2,850', image: 'https://images.unsplash.com/photo-1553315164-49bb0615e0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdWl0fGVufDF8fHx8MTc2MTU1MjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '203', name: 'Summer Linen Suit', price: '$1,950', image: 'https://images.unsplash.com/photo-1553315164-49bb0615e0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdWl0fGVufDF8fHx8MTc2MTU1MjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '204', name: 'Midnight Blue Tuxedo', price: '$3,200', image: 'https://images.unsplash.com/photo-1553315164-49bb0615e0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdWl0fGVufDF8fHx8MTc2MTU1MjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' }
    ]
  },
  shoes: {
    name: 'Classic Shoes',
    description: 'Handcrafted Excellence',
    products: [
      { id: '301', name: 'Oxford Brogues', price: '$685', image: 'https://images.unsplash.com/photo-1650154281741-498255ad3513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGVhdGhlciUyMHNob2VzfGVufDF8fHx8MTc2MTU5NDg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '302', name: 'Monk Strap Shoes', price: '$745', image: 'https://images.unsplash.com/photo-1650154281741-498255ad3513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGVhdGhlciUyMHNob2VzfGVufDF8fHx8MTc2MTU5NDg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '303', name: 'Chelsea Boots', price: '$895', image: 'https://images.unsplash.com/photo-1650154281741-498255ad3513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGVhdGhlciUyMHNob2VzfGVufDF8fHx8MTc2MTU5NDg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '304', name: 'Derby Shoes', price: '$625', image: 'https://images.unsplash.com/photo-1650154281741-498255ad3513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGVhdGhlciUyMHNob2VzfGVufDF8fHx8MTc2MTU5NDg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' }
    ]
  },
  shirts: {
    name: 'Shirts',
    description: 'Sophisticated Style',
    products: [
      { id: '401', name: 'White Oxford Shirt', price: '$385', image: 'https://images.unsplash.com/photo-1545921095-3e9b7ae8d85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNoaXJ0fGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '402', name: 'Blue Chambray Shirt', price: '$425', image: 'https://images.unsplash.com/photo-1545921095-3e9b7ae8d85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNoaXJ0fGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '403', name: 'Striped Dress Shirt', price: '$465', image: 'https://images.unsplash.com/photo-1545921095-3e9b7ae8d85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNoaXJ0fGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { id: '404', name: 'Linen Summer Shirt', price: '$345', image: 'https://images.unsplash.com/photo-1545921095-3e9b7ae8d85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNoaXJ0fGVufDF8fHx8MTc2MTU5NDg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' }
    ]
  }
};

export function CategoryPage() {
  const { goBack, categoryId, navigateTo } = useRouter();
  const category = categoryProducts[categoryId || 'suits'];

  if (!category) {
    return <div>Category not found</div>;
  }

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

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <p className="mb-2 text-xs tracking-[0.2em] text-zinc-500">{category.description}</p>
          <h1>{category.name}</h1>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {category.products.map((product: any, index: number) => (
            <ProductCard key={product.id} product={product} index={index} navigateTo={navigateTo} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  index,
  navigateTo
}: {
  product: any;
  index: number;
  navigateTo: any;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => navigateTo('product', { productId: product.id })}
    >
      <div
        className="relative h-[400px] overflow-hidden bg-zinc-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute right-4 top-4 z-10 rounded-full border border-black/20 bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${isFavorited ? 'fill-black stroke-black' : 'stroke-black'}`}
          />
        </button>

        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full w-full"
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </motion.div>
      </div>

      <div className="mt-4 text-left">
        <h4 className="mb-1 text-black">{product.name}</h4>
        <p className="text-xs text-zinc-600">{product.price}</p>
      </div>
    </motion.div>
  );
}
