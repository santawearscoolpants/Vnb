import { Navigation } from './components/Navigation';
import { FooterNew } from './components/FooterNew';
import { RouterProvider, useRouter } from './context/RouterContext';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { InvestPage } from './pages/InvestPage';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentPage } = useRouter();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'product':
        return <ProductDetailPage />;
      case 'category':
        return <CategoryPage />;
      case 'invest':
        return <InvestPage />;
      case 'account':
        return <AccountPage />;
      case 'cart':
        return <CartPage />;
      default:
        return <HomePage />;
    }
  };

  // Pages with custom footers (don't show FooterNew)
  const pagesWithCustomFooter = ['cart'];
  const showFooter = !pagesWithCustomFooter.includes(currentPage);

  return (
    <div className="min-h-screen">
      <Navigation />
      {renderPage()}
      {showFooter && <FooterNew />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}