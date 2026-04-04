const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

let initialized = false;

export function initGA() {
  if (initialized || !GA_ID) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(pageName: string) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname || `/${pageName}`,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', name, params);
}
