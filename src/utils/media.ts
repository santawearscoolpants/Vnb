const MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_URL || '').replace(/\/+$/, '');

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (!MEDIA_BASE_URL) return url;
  return `${MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export { MEDIA_BASE_URL };
