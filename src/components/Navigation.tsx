import { motion } from 'motion/react';
import { ShoppingBag, Menu, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import logo from "../assets/logo.png";
import { useRouter } from '../context/RouterContext';
import { MenuSidebar } from './MenuSidebar';
import { SearchDialog } from './SearchDialog';
import { ContactSidebar } from './ContactSidebar';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { navigateTo, currentPage } = useRouter();
  const { cart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force solid background on certain pages or when scrolled
  const forceSolidBg = currentPage !== 'home' || isScrolled;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          forceSolidBg ? 'bg-black/95 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid h-20 grid-cols-3 items-center">
            {/* Left - Menu & Search */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 md:hidden">
                <NavIcon icon={Menu} label="Menu" onClick={() => setIsMenuOpen(true)} />
                <NavIcon icon={Search} label="Search" onClick={() => setIsSearchOpen(true)} />
              </div>
              <div className="hidden items-center gap-6 md:flex">
                <NavIcon icon={Menu} label="Menu" onClick={() => setIsMenuOpen(true)} />
                <NavIcon icon={Search} label="Search" onClick={() => setIsSearchOpen(true)} />
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex flex-col items-center justify-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => navigateTo('home')}
              >
                <img src={logo} alt="Vines & Branches" className="h-12 w-auto brightness-0 invert" />
              </motion.button>
              <span className="text-xs tracking-wider text-white/70">GHANA</span>
            </div>

            {/* Right - Contact, Invest & Icons */}
            <div className="flex items-center justify-end gap-4 md:gap-6">
              <div className="hidden items-center gap-6 lg:flex">
                <NavLink onClick={() => setIsContactOpen(true)}>Contact Us</NavLink>
                <NavLink onClick={() => navigateTo('invest')}>Invest</NavLink>
              </div>
              <NavIcon icon={User} label="Account" onClick={() => navigateTo('account')} />
              <NavIcon icon={ShoppingBag} label="Cart" badge={cart?.item_count || 0} onClick={() => navigateTo('cart')} />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Menu Sidebar */}
      <MenuSidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Search Dialog */}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Contact Sidebar */}
      <ContactSidebar isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}

function NavLink({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className="relative text-sm text-white transition-colors hover:text-white/80"
    >
      {children}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-white"
      />
    </motion.button>
  );
}

function NavIcon({
  icon: Icon,
  label,
  badge,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative text-white"
      aria-label={label}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      {badge && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs text-black">
          {badge}
        </span>
      )}
    </motion.button>
  );
}