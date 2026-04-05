/** Join a CDN/base URL with a stored path (pure — used in unit tests). */
export function joinMediaBaseUrl(base: string, url?: string | null): string {
  const trimmed = base.replace(/\/+$/, '');
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (!trimmed) return url;
  return `${trimmed}${url.startsWith('/') ? '' : '/'}${url}`;
}

const MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_URL || '').replace(/\/+$/, '');

export function resolveMediaUrl(url?: string | null): string {
  return joinMediaBaseUrl(MEDIA_BASE_URL, url);
}

export { MEDIA_BASE_URL };
