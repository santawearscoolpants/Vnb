export type ParsedRoute = {
  currentPage: string;
  productId: string | null;
  categoryId: string | null;
  pageParams: Record<string, string>;
};

const RESERVED_LEGACY_QUERY_KEYS = new Set(['page', 'productId', 'categoryId']);

function normalizePath(pathname: string) {
  const clean = String(pathname || '/').trim();
  if (!clean || clean === '/') return '/';
  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}

function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function collectQueryParams(search: string, excludeLegacyKeys = false) {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (excludeLegacyKeys && RESERVED_LEGACY_QUERY_KEYS.has(key)) continue;
    out[key] = value;
  }
  return out;
}

function parseLegacyQueryRoute(search: string): ParsedRoute {
  const params = new URLSearchParams(search);
  const callbackReference = params.get('reference') || params.get('trxref') || '';

  if (params.get('payment_callback') === '1' || callbackReference) {
    const extra: Record<string, string> = {};
    if (callbackReference) extra.reference = callbackReference;
    const status = params.get('status');
    if (status) extra.status = status;
    return {
      currentPage: 'payment-callback',
      productId: null,
      categoryId: null,
      pageParams: extra,
    };
  }

  const currentPage = params.get('page') || 'home';
  const productId = params.get('productId');
  const categoryId = params.get('categoryId');
  const pageParams = collectQueryParams(search, true);

  return {
    currentPage,
    productId,
    categoryId,
    pageParams,
  };
}

export function isLegacyQueryRoute(search: string) {
  const params = new URLSearchParams(search);
  return params.has('page') || params.has('productId') || params.has('categoryId');
}

export function parseRouteFromLocation(pathname: string, search: string): ParsedRoute {
  const normalizedPath = normalizePath(pathname);
  const params = new URLSearchParams(search);
  const callbackReference = params.get('reference') || params.get('trxref') || '';

  if (
    (params.get('payment_callback') === '1' || callbackReference) &&
    (normalizedPath === '/' || normalizedPath === '/payment-callback')
  ) {
    const pageParams = collectQueryParams(search, true);
    if (callbackReference) pageParams.reference = callbackReference;
    return {
      currentPage: 'payment-callback',
      productId: null,
      categoryId: null,
      pageParams,
    };
  }

  if (isLegacyQueryRoute(search)) {
    return parseLegacyQueryRoute(search);
  }

  if (normalizedPath === '/product' || normalizedPath.startsWith('/product/')) {
    const productId = decodeParam(normalizedPath.split('/')[2] || '');
    return {
      currentPage: 'product',
      productId: productId || null,
      categoryId: null,
      pageParams: collectQueryParams(search),
    };
  }

  if (normalizedPath === '/category' || normalizedPath.startsWith('/category/')) {
    const categoryId = decodeParam(normalizedPath.split('/')[2] || '');
    return {
      currentPage: 'category',
      productId: null,
      categoryId: categoryId || null,
      pageParams: collectQueryParams(search),
    };
  }

  const pathToPage: Record<string, string> = {
    '/': 'home',
    '/invest': 'invest',
    '/account': 'account',
    '/create-account': 'create-account',
    '/check-email': 'check-email',
    '/cart': 'cart',
    '/account/dashboard': 'account-dashboard',
    '/account-dashboard': 'account-dashboard',
    '/checkout': 'checkout',
    '/order-confirmation': 'order-confirmation',
    '/forgot-password': 'forgot-password',
    '/reset-password': 'reset-password',
    '/payment-callback': 'payment-callback',
    '/contact': 'contact',
    '/faq': 'faq',
    '/care-services': 'care-services',
    '/stewards': 'stewards',
    '/info': 'info',
  };

  return {
    currentPage: pathToPage[normalizedPath] || 'home',
    productId: null,
    categoryId: null,
    pageParams: collectQueryParams(search),
  };
}

export function buildUrlFromRoute(
  page: string,
  productId: string | null,
  categoryId: string | null,
  params: Record<string, string>,
) {
  let pathname = '/';
  switch (page) {
    case 'home':
      pathname = '/';
      break;
    case 'product':
      pathname = productId ? `/product/${encodeURIComponent(productId)}` : '/';
      break;
    case 'category':
      pathname = categoryId ? `/category/${encodeURIComponent(categoryId)}` : '/';
      break;
    case 'invest':
      pathname = '/invest';
      break;
    case 'account':
      pathname = '/account';
      break;
    case 'create-account':
      pathname = '/create-account';
      break;
    case 'check-email':
      pathname = '/check-email';
      break;
    case 'cart':
      pathname = '/cart';
      break;
    case 'account-dashboard':
      pathname = '/account/dashboard';
      break;
    case 'checkout':
      pathname = '/checkout';
      break;
    case 'order-confirmation':
      pathname = '/order-confirmation';
      break;
    case 'forgot-password':
      pathname = '/forgot-password';
      break;
    case 'reset-password':
      pathname = '/reset-password';
      break;
    case 'payment-callback':
      pathname = '/payment-callback';
      break;
    case 'contact':
      pathname = '/contact';
      break;
    case 'faq':
      pathname = '/faq';
      break;
    case 'care-services':
      pathname = '/care-services';
      break;
    case 'stewards':
      pathname = '/stewards';
      break;
    case 'info':
      pathname = '/info';
      break;
    default:
      pathname = '/';
      break;
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function parseRouteFromSearch(search: string): ParsedRoute {
  return parseRouteFromLocation('/', search);
}

export function buildSearchFromRoute(
  page: string,
  productId: string | null,
  categoryId: string | null,
  params: Record<string, string>,
) {
  const full = buildUrlFromRoute(page, productId, categoryId, params);
  const searchIndex = full.indexOf('?');
  return searchIndex >= 0 ? full.slice(searchIndex) : '';
}
