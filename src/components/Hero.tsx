import { useState } from "react";
import { motion } from "motion/react";
import logo from "../assets/logo.png";
import videoSrc from "../assets/vid2.mp4";

// Small inline SVG fallback (white text) encoded as a data URL so the logo
// always displays even if the imported asset fails to load.
const svgFallback = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='64' viewBox='0 0 256 64'>
    <rect width='100%' height='100%' fill='black' />
    <text x='50%' y='50%' font-size='28' fill='white' font-family='Arial, Helvetica, sans-serif' text-anchor='middle' dominant-baseline='central'>VNB</text>
  </svg>`
)}`; 

function LogoImage({ src }: { src: string }) {
  // Try the imported module URL first, then common public/static paths, then the svgFallback.
  const candidatePaths = [src, '/src/assets/logo.png', '/assets/logo.png', '/logo.png', svgFallback];
  const [index, setIndex] = useState(0);
  const currentSrc = candidatePaths[index] || svgFallback;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={currentSrc}
      alt="Vines & Branches Logo"
      className="mb-8"
      style={{ height: 64, width: "auto" }}
      onError={() => {
        // advance to the next candidate; if already at last, stay on svgFallback
        if (index < candidatePaths.length - 1) {
          setIndex((i) => i + 1);
          // also emit a console warning to help debugging in the browser
          // (will only appear in the developer console)
          // eslint-disable-next-line no-console
          console.warn(`Logo failed to load from ${currentSrc}, trying fallback...`);
        }
      }}
      decoding="async"
      loading="eager"
    />
  );
}

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
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Logo at the top with a robust fallback if the asset fails to load */}
        <LogoImage src={logo} />

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