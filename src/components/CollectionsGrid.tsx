import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import bagImg from '../assets/collection/bag.jpg';
import braceletImg from '../assets/collection/bracelet.jpg';
import cologneImg from '../assets/collection/cologne.jpg';
import kaftanImg from '../assets/collection/kaftan.jpg';
import poloImg from '../assets/collection/polo.jpg';
import shoeImg from '../assets/collection/shoe.jpg';
import suitImg from '../assets/collection/suit.jpg';
import watchImg from '../assets/collection/watch.jpg';

const COLLECTIONS = [
  { src: bagImg, alt: 'Bag', label: 'BAGS' },
  { src: braceletImg, alt: 'Bracelet', label: 'JEWELLERY' },
  { src: cologneImg, alt: 'Cologne', label: 'FRAGRANCE' },
  { src: kaftanImg, alt: 'Kaftan', label: 'KAFTAN' },
  { src: poloImg, alt: 'Polo', label: 'SHIRTS' },
  { src: shoeImg, alt: 'Shoes', label: 'SHOES' },
  { src: suitImg, alt: 'Suit', label: 'SUITS' },
  { src: watchImg, alt: 'Watch', label: 'WATCH' },
];

export function CollectionsGrid() {
  return (
    <section className="bg-zinc-50 px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-4 gap-x-2 gap-y-6"
        >
          {COLLECTIONS.map((img, idx) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              className="group"
            >
              <div className="aspect-square overflow-hidden bg-zinc-100">
                <ImageWithFallback
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-[10px] font-medium tracking-[0.25em] text-zinc-500">
                {img.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

