import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/I18nContext';
import api from '../services/api';

export function Newsletter() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.subscribeNewsletter(email);
      toast.success(t('newsletter.success'));
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || t('newsletter.error'));
    } finally {
      setLoading(false);
    }
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
          <h2 className="mb-4 text-white">{t('newsletter.title')}</h2>
          <p className="mb-12 text-white/70">
            {t('newsletter.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-4">
            <Input
              type="email"
              placeholder={t('newsletter.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              disabled={loading}
            >
              {loading ? t('newsletter.subscribing') : t('newsletter.subscribe')}
            </Button>
          </form>

          <p className="mt-6 text-xs text-white/50">
            {t('newsletter.consent')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}