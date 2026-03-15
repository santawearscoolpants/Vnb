import { motion } from 'motion/react';
import { Package, Droplets, Sparkles, Mail } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { CONTACT_EMAILS } from '../constants/contact';

export function CareServicesPage() {
  const { t } = useI18n();

  const sections = [
    {
      icon: Package,
      titleKey: 'careServices.storageTitle' as const,
      bodyKey: 'careServices.storageBody' as const,
    },
    {
      icon: Droplets,
      titleKey: 'careServices.cleaningTitle' as const,
      bodyKey: 'careServices.cleaningBody' as const,
    },
    {
      icon: Sparkles,
      titleKey: 'careServices.leatherTitle' as const,
      bodyKey: 'careServices.leatherBody' as const,
    },
  ];

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
            <h1 className="mb-4">{t('careServices.heading')}</h1>
            <p className="text-white/80">{t('careServices.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 text-center text-zinc-600"
          >
            {t('careServices.intro')}
          </motion.p>

          <div className="space-y-8">
            {sections.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <motion.div
                key={titleKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex gap-6 rounded-sm border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium text-black">
                    {t(titleKey)}
                  </h3>
                  <p className="text-zinc-600">{t(bodyKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 rounded-sm border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-4">
              <Mail className="h-6 w-6 shrink-0 text-zinc-700" />
              <div>
                <h3 className="mb-1 font-medium text-black">
                  {t('careServices.repairsTitle')}
                </h3>
                <p className="mb-3 text-sm text-zinc-600">
                  {t('careServices.repairsBody')}
                </p>
                <a
                  href={`mailto:${CONTACT_EMAILS.customerCare}`}
                  className="text-sm font-medium text-black underline hover:no-underline"
                >
                  {CONTACT_EMAILS.customerCare}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
