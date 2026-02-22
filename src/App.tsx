import { Navigation } from './components/Navigation';
import { FooterNew } from './components/FooterNew';
import { RouterProvider, useRouter } from './context/RouterContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { InvestPage } from './pages/InvestPage';
import { AccountPage } from './pages/AccountPage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
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
      case 'create-account':
        return <CreateAccountPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      default:
        return <HomePage />;
    }
  };

  // Pages with custom footers (don't show FooterNew)
  const pagesWithCustomFooter = ['cart', 'checkout', 'order-confirmation'];
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
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  );
}