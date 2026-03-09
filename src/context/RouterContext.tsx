import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigateParams {
  productId?: string;
  categoryId?: string;
  [key: string]: string | undefined;
}

interface RouterContextType {
  currentPage: string;
  productId: string | null;
  categoryId: string | null;
  pageParams: Record<string, string>;
  navigateTo: (page: string, params?: NavigateParams) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function getInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  const callbackReference = params.get('reference') || params.get('trxref');

  if (params.get('payment_callback') === '1' || callbackReference) {
    const extra: Record<string, string> = {};
    if (callbackReference) extra.reference = callbackReference;
    const status = params.get('status');
    if (status) extra.status = status;
    return {
      currentPage: 'payment-callback',
      pageParams: extra,
      history: ['home', 'checkout', 'payment-callback'],
    };
  }

  return {
    currentPage: 'home',
    pageParams: {},
    history: ['home'],
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const initialRoute = getInitialRoute();
  const [currentPage, setCurrentPage] = useState(initialRoute.currentPage);
  const [productId, setProductId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [pageParams, setPageParams] = useState<Record<string, string>>(initialRoute.pageParams);
  const [history, setHistory] = useState<string[]>(initialRoute.history);

  const navigateTo = (page: string, params?: NavigateParams) => {
    setCurrentPage(page);
    setProductId(params?.productId || null);
    setCategoryId(params?.categoryId || null);
    const extra: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (k !== 'productId' && k !== 'categoryId' && v !== undefined) extra[k] = v;
      }
    }
    setPageParams(extra);
    setHistory(prev => [...prev, page]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPage(previousPage);
      setPageParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ currentPage, productId, categoryId, pageParams, navigateTo, goBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
