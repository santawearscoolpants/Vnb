import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { RouterProvider, useRouter } from './context/RouterContext';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { InvestPage } from './pages/InvestPage';
import { AccountPage } from './pages/AccountPage';
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
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      {renderPage()}
      <Footer />
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