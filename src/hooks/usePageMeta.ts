import { useEffect } from 'react';
import logoImage from '../assets/logo.png';

interface PageMeta {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

const BRAND = 'Vines & Branches';
const DEFAULT_DESCRIPTION = 'African luxury fashion — premium handcrafted pieces from Ghana to the world.';
const DEFAULT_OG_IMAGE = logoImage;

function setMeta(name: string, content: string, attribute = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export function usePageMeta(meta: PageMeta) {
  const locationKey = `${window.location.pathname}${window.location.search}`;

  useEffect(() => {
    const title = meta.title ? `${meta.title} | ${BRAND}` : BRAND;
    document.title = title;

    setMeta('description', meta.description || DEFAULT_DESCRIPTION);

    setMeta('og:title', meta.ogTitle || meta.title || BRAND, 'property');
    setMeta('og:description', meta.ogDescription || meta.description || DEFAULT_DESCRIPTION, 'property');
    setMeta('og:image', meta.ogImage || DEFAULT_OG_IMAGE, 'property');
    setMeta('og:type', meta.ogType || 'website', 'property');
    setMeta('og:site_name', BRAND, 'property');
    setMeta('og:url', window.location.href, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', meta.ogTitle || meta.title || BRAND);
    setMeta('twitter:description', meta.ogDescription || meta.description || DEFAULT_DESCRIPTION);
    setMeta('twitter:image', meta.ogImage || DEFAULT_OG_IMAGE);
    setCanonical(window.location.href);
  }, [locationKey, meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogImage, meta.ogType]);
}

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title: 'Home',
    description: 'Discover African luxury fashion at Vines & Branches — handcrafted pieces, premium quality, timeless design.',
  },
  category: {
    title: 'Collections',
    description: 'Browse our curated luxury fashion collections — women\'s, men\'s, and accessories.',
    ogType: 'product.group',
  },
  product: {
    title: 'Product',
    description: 'Premium handcrafted luxury fashion from Vines & Branches.',
    ogType: 'product',
  },
  cart: {
    title: 'Shopping Bag',
    description: 'Review your shopping bag and proceed to checkout.',
  },
  checkout: {
    title: 'Checkout',
    description: 'Complete your order securely at Vines & Branches.',
  },
  'order-confirmation': {
    title: 'Order Confirmed',
    description: 'Your order has been placed successfully.',
  },
  invest: {
    title: 'Invest',
    description: 'Invest in the future of African luxury fashion — explore investment opportunities with Vines & Branches.',
  },
  account: {
    title: 'Sign In',
    description: 'Sign in to your Vines & Branches account.',
  },
  'create-account': {
    title: 'Create Account',
    description: 'Create your Vines & Branches account to start shopping.',
  },
  'check-email': {
    title: 'Check Your Email',
    description: 'Confirm your email address to finish setting up your Vines & Branches account.',
  },
  'account-dashboard': {
    title: 'My Account',
    description: 'Manage your orders, addresses, and profile settings.',
  },
  'forgot-password': {
    title: 'Reset Password',
    description: 'Reset your Vines & Branches account password.',
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Vines & Branches — phone, email, and contact form.',
  },
  faq: {
    title: 'FAQ',
    description: 'Frequently asked questions about orders, shipping, returns, and product care.',
  },
  'care-services': {
    title: 'Care Services',
    description: 'How to care for your Vines & Branches pieces — storage, cleaning, leather care, and repairs.',
  },
  stewards: {
    title: 'VNB Stewards',
    description: 'Join the VNB Steward community program, earn commission on verified referred orders, and unlock milestone rewards.',
  },
  info: {
    title: 'Information',
    description: 'Official Vines & Branches information pages for legal notices, policies, and service details.',
  },
};
