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
  { src: bagImg, alt: 'Collection bag' },
  { src: braceletImg, alt: 'Collection bracelet' },
  { src: cologneImg, alt: 'Collection cologne' },
  { src: kaftanImg, alt: 'Collection kaftan' },
  { src: poloImg, alt: 'Collection polo' },
  { src: shoeImg, alt: 'Collection shoe' },
  { src: suitImg, alt: 'Collection suit' },
  { src: watchImg, alt: 'Collection watch' },
];

export function CollectionsGrid() {
  return (
    <section className="bg-white px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-2"
        >
          {COLLECTIONS.map((img, idx) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              className="group overflow-hidden rounded-sm bg-zinc-50"
            >
              <ImageWithFallback
                src={img.src}
                alt={img.alt}
                className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01] sm:h-24 md:h-28"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

