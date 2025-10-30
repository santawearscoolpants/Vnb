import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { RouterProvider, useRouter } from './context/RouterContext';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { ContactPage } from './pages/ContactPage';
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
      case 'contact':
        return <ContactPage />;
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