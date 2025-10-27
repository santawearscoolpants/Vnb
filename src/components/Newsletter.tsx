import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="bg-zinc-900 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-white">Join the Vines & Branches Circle</h2>
          <p className="mb-12 text-white/70">
            Be the first to discover new collections, exclusive offers, and styling tips.
            Subscribe to our newsletter and receive 10% off your first purchase.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-black hover:bg-white/90"
            >
              Subscribe
            </Button>
          </form>

          <p className="mt-6 text-xs text-white/50">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
