import { createContext, useContext, useState, ReactNode } from 'react';

interface RouterContextType {
  currentPage: string;
  productId: string | null;
  categoryId: string | null;
  navigateTo: (page: string, params?: { productId?: string; categoryId?: string }) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [productId, setProductId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(['home']);

  const navigateTo = (page: string, params?: { productId?: string; categoryId?: string }) => {
    setCurrentPage(page);
    setProductId(params?.productId || null);
    setCategoryId(params?.categoryId || null);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ currentPage, productId, categoryId, navigateTo, goBack }}>
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
