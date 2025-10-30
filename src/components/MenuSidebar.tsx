import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
}

const menuItems = [
  { label: 'Gifts and Personalization', link: 'home' },
  { label: 'New', link: 'home' },
  { label: 'Bags and Wallets', link: 'category', categoryId: 'bags', hasSubmenu: true },
  { label: 'Women', link: 'home' },
  { label: 'Men', link: 'home' },
  { label: 'Perfumes and Beauty', link: 'category', categoryId: 'fragrances' },
  { label: 'Jewelry', link: 'category', categoryId: 'jewelleries' },
  { label: 'Watches', link: 'home' },
  { label: 'Trunks, Travel and Home', link: 'home' },
  { label: 'Services', link: 'home' },
  { label: 'The Maison VNB', link: 'home' }
];

export function MenuSidebar({ isOpen, onClose, onOpenContact }: MenuSidebarProps) {
  const { navigateTo } = useRouter();

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.categoryId) {
      navigateTo('category', { categoryId: item.categoryId });
    } else {
      navigateTo(item.link);
    }
    onClose();
  };

  const handleContactClick = () => {
    onClose();
    setTimeout(() => {
      onOpenContact?.();
    }, 400);
  };

  const handleInvestClick = () => {
    navigateTo('invest');
    onClose();
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
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => handleItemClick(item)}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="text-sm">{item.label}</span>
                    {item.hasSubmenu && (
                      <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1" />
                    )}
                  </motion.button>
                ))}
                
                {/* Mobile-only items */}
                <div className="mt-6 border-t border-zinc-200 pt-4 lg:hidden">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.05, duration: 0.3 }}
                    onClick={handleContactClick}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="text-sm">Contact Us</span>
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (menuItems.length + 1) * 0.05, duration: 0.3 }}
                    onClick={handleInvestClick}
                    className="group flex w-full items-center justify-between py-3 text-left text-zinc-800 transition-colors hover:text-black"
                  >
                    <span className="text-sm">Invest</span>
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