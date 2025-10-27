import { motion } from 'motion/react';
import { Award, Sparkles, Heart } from 'lucide-react';

const values = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the finest materials and craftsmanship make it into our collection.'
  },
  {
    icon: Sparkles,
    title: 'Timeless Design',
    description: 'Classic pieces that transcend trends and remain elegant for years to come.'
  },
  {
    icon: Heart,
    title: 'Sustainable Luxury',
    description: 'We believe in creating beautiful products responsibly and ethically.'
  }
];

export function BrandStory() {
  return (
    <section className="bg-white px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-6 text-black">Our Philosophy</h2>
          <p className="mx-auto max-w-3xl text-zinc-600">
            VNB was born from a passion for creating exceptional fashion pieces that
            celebrate individuality and refinement. Every item we create is a testament
            to our dedication to excellence and timeless style.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid gap-12 md:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-black"
              >
                <value.icon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="mb-4 text-black">{value.title}</h3>
              <p className="text-zinc-600">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 grid gap-8 border-y border-zinc-200 py-12 md:grid-cols-4"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-2"
            >
              10+
            </motion.div>
            <p className="text-sm text-zinc-600">Years of Excellence</p>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-2"
            >
              50K+
            </motion.div>
            <p className="text-sm text-zinc-600">Satisfied Customers</p>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-2"
            >
              100+
            </motion.div>
            <p className="text-sm text-zinc-600">Artisan Partners</p>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-2"
            >
              20+
            </motion.div>
            <p className="text-sm text-zinc-600">Countries Worldwide</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
