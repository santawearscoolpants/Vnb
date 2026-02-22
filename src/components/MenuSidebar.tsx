import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Lock } from 'lucide-react';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
}

const menuItems = [
  { label: 'Gifts and Personalization' },
  { label: 'New' },
  { label: 'Bags and Wallets', hasSubmenu: true },
  { label: 'Women' },
  { label: 'Men' },
  { label: 'Perfumes and Beauty' },
  { label: 'Jewelry' },
  { label: 'Watches' },
  { label: 'Trunks, Travel and Home' },
  { label: 'Services' },
  { label: 'The Maison VNB' }
];

const jitterKeyframes = {
  x: [0, -4, 4, -3, 3, -2, 2, 0],
  transition: { duration: 0.4, ease: 'easeInOut' as const },
};

export function MenuSidebar({ isOpen, onClose, onOpenContact }: MenuSidebarProps) {
  const [jitterKey, setJitterKey] = useState<string | null>(null);

  const handleLockedTap = (key: string) => {
    setJitterKey(null);
    requestAnimationFrame(() => setJitterKey(key));
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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-2xl"
          >
            {/* Close Button */}
            <div className="flex items-center justify-between border-b border-zinc-200 p-6">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-black"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto p-6" style={{ height: 'calc(100% - 73px)' }}>
              <nav className="space-y-1">
                {menuItems.map((item, index) => {
                  const key = `menu-${index}`;
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={jitterKey === key ? jitterKeyframes : { opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => handleLockedTap(key)}
                      className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <Lock className="h-3 w-3 text-zinc-400 opacity-40" aria-hidden />
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-zinc-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </motion.button>
                  );
                })}
                
                {/* Mobile-only items */}
                <div className="mt-6 border-t border-zinc-200 pt-4 lg:hidden">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={jitterKey === 'contact' ? jitterKeyframes : { opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.05, duration: 0.3 }}
                    onClick={() => handleLockedTap('contact')}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Lock className="h-3 w-3 text-zinc-400 opacity-40" aria-hidden />
                      Contact Us
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={jitterKey === 'invest' ? jitterKeyframes : { opacity: 1, x: 0 }}
                    transition={{ delay: (menuItems.length + 1) * 0.05, duration: 0.3 }}
                    onClick={() => handleLockedTap('invest')}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Lock className="h-3 w-3 text-zinc-400 opacity-40" aria-hidden />
                      Invest
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </motion.button>
                </div>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}