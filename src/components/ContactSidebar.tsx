import { motion, AnimatePresence } from 'motion/react';
import { X, Phone } from 'lucide-react';
import { CONTACT_EMAILS, CONTACT_PHONES } from '../constants/contact';
import { useI18n } from '../i18n/I18nContext';
import { useRouter } from '../context/RouterContext';

interface ContactSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSidebar({ isOpen, onClose }: ContactSidebarProps) {
  const { t } = useI18n();
  const { navigateTo } = useRouter();

  const handleFaqClick = () => {
    onClose();
    navigateTo('faq');
  };

  const handleCareServicesClick = () => {
    onClose();
    navigateTo('care-services');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full bg-white shadow-2xl sm:w-[500px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 p-6">
              <h2 className="text-black">{t('nav.contactUs')}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-zinc-600 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <p className="text-sm text-zinc-600">
                  {t('contactSidebar.welcome')}
                </p>

                {/* Phone Numbers */}
                <div className="space-y-2 border-b border-zinc-200 pb-6">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-zinc-700" />
                    <a
                      href={CONTACT_PHONES.primaryHref}
                      className="text-zinc-900 transition-colors hover:text-zinc-600"
                    >
                      {CONTACT_PHONES.primary}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-transparent" />
                    <a
                      href={CONTACT_PHONES.secondaryHref}
                      className="text-zinc-900 transition-colors hover:text-zinc-600"
                    >
                      {CONTACT_PHONES.secondary}
                    </a>
                  </div>
                </div>

                {/* Emails */}
                <div className="space-y-2 border-b border-zinc-200 pb-6 text-sm text-zinc-700">
                  <a href={`mailto:${CONTACT_EMAILS.customerCare}`} className="block transition-colors hover:text-zinc-900">
                    {CONTACT_EMAILS.customerCare}
                  </a>
                  <a href={`mailto:${CONTACT_EMAILS.info}`} className="block transition-colors hover:text-zinc-900">
                    {CONTACT_EMAILS.info}
                  </a>
                </div>

                {/* Need Help Section */}
                <div>
                  <h3 className="mb-4 text-sm text-zinc-900">{t('contactSidebar.needHelp')}</h3>
                  <nav className="space-y-1">
                    <button
                      type="button"
                      onClick={handleFaqClick}
                      className="block w-full border-b border-zinc-100 py-3 text-left text-sm text-zinc-900 transition-colors hover:text-zinc-600"
                    >
                      {t('contactSidebar.faq')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCareServicesClick}
                      className="block w-full border-b border-zinc-100 py-3 text-left text-sm text-zinc-900 transition-colors hover:text-zinc-600"
                    >
                      {t('contactSidebar.careServices')}
                    </button>
                  </nav>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
