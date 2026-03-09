import { motion, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { useRef } from 'react';
import logo from "../assets/logo.png";
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../i18n/I18nContext';

export function FeaturedCollection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useRouter();
  const { t } = useI18n();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Side */}
          <motion.div
            style={{ y }}
            className="relative h-[500px] overflow-hidden rounded-sm lg:h-[600px]"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1569388330292-79cc1ec67270?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXN8ZW58MXx8fHwxNzYxNTIyNDkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Featured Collection"
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Content Side */}
          <motion.div
            style={{ opacity }}
            className="flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-4 text-sm tracking-[0.3em] text-white/60">
                {t('collection.season')}
              </p>
              <h2 className="mb-6 text-white">
                {t('collection.title')}
              </h2>
              <p className="mb-8 text-white/80">
                {t('collection.p1')}
              </p>
              <p className="mb-12 text-white/80">
                {t('collection.p2')}
              </p>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90"
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('collection.cta')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.03 }}
        viewport={{ once: true }}
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
      >
        <img src={logo} alt="" className="h-[300px] w-auto brightness-0 invert opacity-50" />
      </motion.div>
    </section>
  );
}