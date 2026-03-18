import { describe, it, expect } from 'vitest';
import { formatPrice, getWhatsAppLink, formatViewCount } from '../utils/currency';

describe('formatPrice', () => {
  it('formats PHP price correctly', () => {
    const result = formatPrice(720000, 'PHP', 1);
    expect(result).toContain('₱');
    expect(result).toContain('720');
  });

  it('formats USD price correctly', () => {
    const result = formatPrice(720000, 'USD', 0.018);
    expect(result).toContain('$');
    expect(result).toContain('12,960');
  });

  it('handles zero price', () => {
    const result = formatPrice(0, 'PHP', 1);
    expect(result).toBe('₱0');
  });
});

describe('getWhatsAppLink', () => {
  it('generates a WhatsApp link with pre-filled message', () => {
    const link = getWhatsAppLink('Submariner', '₱720,000', '126610LN', 'Rolex');
    expect(link).toContain('wa.me/');
    expect(link).toContain('Rolex');
    expect(link).toContain('Submariner');
    expect(link).toContain('126610LN');
    expect(link).toContain('720%2C000');
  });

  it('generates message without brand prefix when brand is omitted', () => {
    const link = getWhatsAppLink('Submariner', '₱720,000', '126610LN');
    expect(link).toContain('wa.me/');
    expect(link).toContain('Submariner');
    expect(link).not.toContain('Rolex');
  });
});

describe('formatViewCount', () => {
  it('formats small numbers as-is', () => {
    expect(formatViewCount(42)).toBe('42');
    expect(formatViewCount(999)).toBe('999');
  });

  it('formats thousands with k suffix', () => {
    expect(formatViewCount(1000)).toBe('1.0k');
    expect(formatViewCount(2500)).toBe('2.5k');
    expect(formatViewCount(10000)).toBe('10.0k');
  });
});
