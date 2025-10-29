import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '../context/RouterContext';

const sandals = [
  {
    id: 1,
    name: 'Artisan Leather Sandals',
    price: '$425.00',
    image: 'https://images.unsplash.com/photo-1708962000105-849e984e69a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2FuZGFscyUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NjE2OTY0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 2,
    name: 'Classic Woven Sandals',
    price: '$385.00',
    image: 'https://images.unsplash.com/photo-1670495045221-f7218ee3e3b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzaG9lcyUyMHByb2R1Y3QlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjE2OTY0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 3,
    name: 'Premium Slide Sandals',
    price: '$295.00',
    image: 'https://images.unsplash.com/photo-1652869119567-c1acee6e6d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNhbmRhbHMlMjBzdHVkaW98ZW58MXx8fHwxNzYxNjk2NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 4,
    name: 'Handcrafted Strappy Sandals',
    price: '$465.00',
    image: 'https://images.unsplash.com/photo-1576318683154-ec6acd0dbcb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZm9vdHdlYXIlMjBjbGVhbiUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzYxNjk2NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

export function SandalsSection() {
  const { navigateTo } = useRouter();

  return (
    <section className="bg-white px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-xs tracking-[0.2em] text-zinc-500">NEW</p>
          <h2 className="mb-8 text-black">Summer Sandals Collection</h2>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {sandals.map((sandal, index) => (
            <SandalCard key={sandal.id} sandal={sandal} index={index} navigateTo={navigateTo} />
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex justify-center gap-4"
        >
          <button className="border border-black bg-transparent px-8 py-3 text-sm transition-colors hover:bg-black hover:text-white">
            Shop Women's
          </button>
          <button className="border border-black bg-transparent px-8 py-3 text-sm transition-colors hover:bg-black hover:text-white">
            Shop Men's
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function SandalCard({
  sandal,
  index,
  navigateTo
}: {
  sandal: typeof sandals[0];
  index: number;
  navigateTo: any;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => navigateTo('product', { productId: sandal.id.toString() })}
    >
      {/* Image Container */}
      <div 
        className="relative h-[400px] overflow-hidden bg-zinc-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute right-4 top-4 z-10 rounded-full border border-black/20 bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorited ? 'fill-black stroke-black' : 'stroke-black'
            }`}
          />
        </button>

        {/* Product Image */}
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full w-full"
        >
          <ImageWithFallback
            src={sandal.image}
            alt={sandal.name}
            className="h-full w-full object-contain"
          />
        </motion.div>
      </div>

      {/* Product Info Below Image */}
      <div className="mt-4 text-left">
        <h4 className="mb-1 text-black">{sandal.name}</h4>
        <p className="text-xs text-zinc-600">{sandal.price}</p>
      </div>
    </motion.div>
  );
}
