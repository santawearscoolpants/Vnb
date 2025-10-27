import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import logo from "figma:asset/a4eabd48a91cf2ad3f1c96be6aa7cc8c409fc025.png";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image with Parallax */}
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbW9kZWx8ZW58MXx8fHwxNzYxNTA1NTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          }}
        />
      </motion.div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mb-6 text-xs tracking-[0.2em] text-white/80"
        >
          JOHN 15:5
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mb-6 tracking-[0.2em] text-white/80"
          style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', serif", fontSize: '40px' }}
        >
          Abide . Grow . Bear Fruit
        </motion.p>

      

        <motion.a
          href="#collection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="text-sm text-white underline transition-colors hover:text-white/80"
        >
          Shop Now
        </motion.a>
      </div>
    </section>
  );
}