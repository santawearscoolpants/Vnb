import { motion, AnimatePresence } from 'motion/react';
import { X, Phone } from 'lucide-react';

interface ContactSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSidebar({ isOpen, onClose }: ContactSidebarProps) {
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
              <h2 className="text-black">Contact Us</h2>
              <button
                onClick={onClose}
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
                {/* Welcome Message */}
                <p className="text-sm text-zinc-600">
                  Wherever you are, VNBWAY Client Advisors will be delighted to assist you.
                </p>

                {/* Phone Number */}
                <div className="flex items-center gap-3 border-b border-zinc-200 pb-6">
                  <Phone className="h-5 w-5 text-zinc-700" />
                  <a
                    href="tel:+233123456789"
                    className="text-zinc-900 transition-colors hover:text-zinc-600"
                  >
                    +233(0)59 484 9077 | +233(0)24 909 7323
                  </a>
                </div>

                {/* Need Help Section */}
                <div>
                  <h3 className="mb-4 text-sm text-zinc-900">Need Help?</h3>
                  <nav className="space-y-1">
                    <ContactLink>FAQ</ContactLink>
                    <ContactLink>Care Services</ContactLink>
                    <ContactLink>Find a Store</ContactLink>
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

function ContactLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="block w-full border-b border-zinc-100 py-3 text-left text-sm text-zinc-900 transition-colors hover:text-zinc-600">
      {children}
    </button>
  );
}
