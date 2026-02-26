import { describe, it, expect } from 'vitest';
import { formatCurrency, isValidEmail, isValidPhone, sanitizeFilename } from '../../lib/utils';

describe('formatCurrency', () => {
  it('formats PHP correctly', () => {
    const result = formatCurrency(720000, 'PHP');
    expect(result).toContain('₱');
    expect(result).toContain('720,000');
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(12960, 'USD');
    expect(result).toContain('$');
    expect(result).toContain('12,960');
  });

  it('formats EUR correctly', () => {
    const result = formatCurrency(11500, 'EUR');
    expect(result).toContain('€');
  });

  it('uses currency code for unknown currencies', () => {
    const result = formatCurrency(1000, 'XYZ');
    expect(result).toContain('XYZ');
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@no-user.com')).toBe(false);
    expect(isValidEmail('no-domain@')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid phone numbers', () => {
    expect(isValidPhone('+639123456789')).toBe(true);
    expect(isValidPhone('09123456789')).toBe(true);
    expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('not-a-phone')).toBe(false);
  });
});

describe('sanitizeFilename', () => {
  it('sanitizes special characters', () => {
    expect(sanitizeFilename('my file (1).jpg')).toBe('my_file__1_.jpg');
  });

  it('converts to lowercase', () => {
    expect(sanitizeFilename('MyFile.JPG')).toBe('myfile.jpg');
  });

  it('keeps safe characters', () => {
    expect(sanitizeFilename('valid-file_name.png')).toBe('valid-file_name.png');
  });
});
