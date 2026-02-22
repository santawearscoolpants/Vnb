import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Lock } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
}

// Items with a categoryId navigate to that category; without one they show "coming soon" jitter
const menuItems: { label: string; categoryId?: string; page?: string }[] = [
  { label: 'New', categoryId: 'new' },
  { label: 'Women', categoryId: 'women' },
  { label: 'Men', categoryId: 'men' },
  { label: 'Bags and Wallets', categoryId: 'bags' },
  { label: 'Jewelry', categoryId: 'jewelry' },
  { label: 'Perfumes and Beauty', categoryId: 'fragrances' },
  { label: 'Watches', categoryId: 'watches' },
  { label: 'Gifts and Personalization' },
  { label: 'Trunks, Travel and Home' },
  { label: 'The Maison VNB' },
];

const jitterKeyframes = {
  x: [0, -4, 4, -3, 3, -2, 2, 0],
  transition: { duration: 0.4, ease: 'easeInOut' as const },
};

export function MenuSidebar({ isOpen, onClose, onOpenContact }: MenuSidebarProps) {
  const [jitterKey, setJitterKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { navigateTo } = useRouter();

  const handleLockedTap = useCallback((key: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJitterKey(null);
    requestAnimationFrame(() => {
      setJitterKey(key);
      timerRef.current = setTimeout(() => setJitterKey(null), 2000);
    });
  }, []);

  const handleItemClick = (item: typeof menuItems[0], key: string) => {
    if (item.categoryId) {
      navigateTo('category', { categoryId: item.categoryId });
      onClose();
    } else {
      handleLockedTap(key);
    }
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
                  const isLinked = Boolean(item.categoryId);
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={jitterKey === key ? jitterKeyframes : { opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => handleItemClick(item, key)}
                      className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        {!isLinked && (
                          <Lock className="h-3 w-3 text-zinc-400 opacity-40" aria-hidden />
                        )}
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
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.05, duration: 0.3 }}
                    onClick={() => { onOpenContact?.(); onClose(); }}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="text-sm">Contact Us</span>
                    <ChevronRight className="h-4 w-4 text-zinc-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (menuItems.length + 1) * 0.05, duration: 0.3 }}
                    onClick={() => { navigateTo('invest'); onClose(); }}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="text-sm">Invest</span>
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