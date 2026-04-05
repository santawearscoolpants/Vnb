import { describe, expect, it } from 'vitest';
import { joinMediaBaseUrl } from './media';

describe('joinMediaBaseUrl', () => {
  it('returns empty for missing url', () => {
    expect(joinMediaBaseUrl('https://media.example.com', null)).toBe('');
    expect(joinMediaBaseUrl('https://media.example.com', undefined)).toBe('');
    expect(joinMediaBaseUrl('https://media.example.com', '')).toBe('');
  });

  it('leaves absolute http(s) URLs unchanged', () => {
    expect(joinMediaBaseUrl('https://media.example.com', 'https://other/img.png')).toBe(
      'https://other/img.png',
    );
    expect(joinMediaBaseUrl('https://media.example.com', 'http://other/img.png')).toBe('http://other/img.png');
  });

  it('prefixes relative paths and trims trailing slash on base', () => {
    expect(joinMediaBaseUrl('https://media.example.com/', 'products/a.jpg')).toBe(
      'https://media.example.com/products/a.jpg',
    );
    expect(joinMediaBaseUrl('https://media.example.com', '/products/a.jpg')).toBe(
      'https://media.example.com/products/a.jpg',
    );
  });

  it('returns relative path unchanged when base is empty', () => {
    expect(joinMediaBaseUrl('', 'products/a.jpg')).toBe('products/a.jpg');
  });
});
