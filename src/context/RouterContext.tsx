import { createContext, useCallback, useContext, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  buildUrlFromRoute,
  isLegacyQueryRoute,
  parseRouteFromLocation,
} from '../utils/routing';

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

export function RouterProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = parseRouteFromLocation(location.pathname, location.search);
  const { currentPage, productId, categoryId, pageParams } = parsed;

  useEffect(() => {
    const normalizedUrl = buildUrlFromRoute(currentPage, productId, categoryId, pageParams);
    const currentUrl = `${location.pathname}${location.search}`;
    const isLegacy = isLegacyQueryRoute(location.search) || location.pathname === '/account-dashboard';
    const shouldCanonicalize = isLegacy || (normalizedUrl === '/' && location.pathname !== '/');
    if (shouldCanonicalize && currentUrl !== normalizedUrl) {
      navigate(normalizedUrl, { replace: true });
    }
  }, [categoryId, currentPage, location.pathname, location.search, navigate, pageParams, productId]);

  const navigateTo = useCallback((page: string, params?: NavigateParams) => {
    const nextProductId = params?.productId || null;
    const nextCategoryId = params?.categoryId || null;
    const extra: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (k !== 'productId' && k !== 'categoryId' && v !== undefined) extra[k] = v;
      }
    }

    const nextUrl = buildUrlFromRoute(page, nextProductId, nextCategoryId, extra);
    navigate(nextUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  }, [navigate]);

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
