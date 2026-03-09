import { motion } from "motion/react";
import videoSrc from "../assets/vid2.mp4";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background video with parallax-like scale animation */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 overflow-hidden"
      >
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          // keep video positioned and covering the hero
          style={{ display: 'block' }}
        />
      </motion.div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-end px-4 pb-40 text-center">
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
          style={{ 
            fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', serif", 
            fontSize: 'clamp(24px, 5vw, 40px)',
            lineHeight: '1.2'
          }}
        >
          African Timeless Luxury
        </motion.p>

      

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="text-sm text-white underline transition-colors hover:text-white/80"
          onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Shop Now
        </motion.button>
      </div>
    </section>
  );
}