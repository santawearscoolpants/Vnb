import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { CONTACT_EMAILS } from '../constants/contact';

const FAQ_KEYS = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
  { q: 'faq.q6', a: 'faq.a6' },
] as const;

export function FAQPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-4">{t('faq.heading')}</h1>
            <p className="text-white/80">{t('faq.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {FAQ_KEYS.map(({ q, a }, i) => (
              <div
                key={q}
                className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 text-lg font-medium text-black">
                  {t(q)}
                </h3>
                <p className="text-zinc-600">{t(a)}</p>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center text-sm text-zinc-600"
          >
            {t('faq.moreHelp')}{' '}
            <a
              href={`mailto:${CONTACT_EMAILS.customerCare}`}
              className="font-medium text-black underline hover:no-underline"
            >
              {CONTACT_EMAILS.customerCare}
            </a>
          </motion.p>
        </div>
      </section>
    </div>
  );
}
