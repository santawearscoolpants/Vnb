import { Navigation } from './components/Navigation';
import { FooterNew } from './components/FooterNew';
import { CurrencyPrompt } from './components/CurrencyPrompt';
import { RouterProvider, useRouter } from './context/RouterContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { I18nProvider } from './i18n/I18nContext';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { InvestPage } from './pages/InvestPage';
import { AccountPage } from './pages/AccountPage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { CartPage } from './pages/CartPage';
import { AccountDashboardPage } from './pages/AccountDashboardPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { CareServicesPage } from './pages/CareServicesPage';
import { Toaster } from './components/ui/sonner';
import { usePageMeta, PAGE_META } from './hooks/usePageMeta';
import { initGA, trackPageView } from './utils/analytics';
import { useEffect } from 'react';

function AppContent() {
  const { currentPage } = useRouter();
  usePageMeta(PAGE_META[currentPage] || PAGE_META.home);

  useEffect(() => { initGA(); }, []);
  useEffect(() => { trackPageView(currentPage); }, [currentPage]);

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
      case 'account-dashboard':
        return <AccountDashboardPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'payment-callback':
        return <PaymentCallbackPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'care-services':
        return <CareServicesPage />;
      default:
        return <HomePage />;
    }
  };

  // Pages with custom footers (don't show FooterNew)
  const pagesWithCustomFooter = ['cart', 'checkout', 'order-confirmation', 'payment-callback'];
  const showFooter = !pagesWithCustomFooter.includes(currentPage);

  return (
    <div className="min-h-screen">
      <Navigation />
      {renderPage()}
      {showFooter && <FooterNew />}
      <CurrencyPrompt />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <I18nProvider>
          <CurrencyProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </CurrencyProvider>
        </I18nProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
