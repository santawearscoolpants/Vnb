import { describe, expect, it } from 'vitest';
import {
  buildUrlFromRoute,
  isLegacyQueryRoute,
  parseRouteFromLocation,
  parseRouteFromSearch,
} from './routing';

describe('routing helpers', () => {
  it('parses path-based product routes', () => {
    const route = parseRouteFromLocation('/product/classic-polo', '');
    expect(route.currentPage).toBe('product');
    expect(route.productId).toBe('classic-polo');
  });

  it('parses path-based category routes with query params', () => {
    const route = parseRouteFromLocation('/category/women', '?sort=latest');
    expect(route.currentPage).toBe('category');
    expect(route.categoryId).toBe('women');
    expect(route.pageParams.sort).toBe('latest');
  });

  it('parses payment callback references as payment-callback route', () => {
    const route = parseRouteFromLocation('/payment-callback', '?reference=abc123&status=success');
    expect(route.currentPage).toBe('payment-callback');
    expect(route.pageParams.reference).toBe('abc123');
    expect(route.pageParams.status).toBe('success');
  });

  it('keeps legacy query routing parse behavior for backward compatibility', () => {
    const route = parseRouteFromSearch('?page=product&productId=classic-polo&from=search');
    expect(route.currentPage).toBe('product');
    expect(route.productId).toBe('classic-polo');
    expect(route.pageParams.from).toBe('search');
  });

  it('detects legacy query-mode routes', () => {
    expect(isLegacyQueryRoute('?page=home')).toBe(true);
    expect(isLegacyQueryRoute('?categoryId=women')).toBe(true);
    expect(isLegacyQueryRoute('?sort=latest')).toBe(false);
  });

  it('builds stable canonical urls from route state', () => {
    expect(buildUrlFromRoute('home', null, null, {})).toBe('/');
    expect(buildUrlFromRoute('product', 'classic-polo', null, {})).toBe('/product/classic-polo');
    expect(buildUrlFromRoute('category', null, 'women', { sort: 'latest' })).toBe('/category/women?sort=latest');
    expect(buildUrlFromRoute('account-dashboard', null, null, { tab: 'steward' })).toBe('/account/dashboard?tab=steward');
  });
});
