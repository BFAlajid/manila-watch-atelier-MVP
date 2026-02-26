// Utility Functions

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    SGD: 'S$',
    HKD: 'HK$',
    AUD: 'A$',
  };

  const symbol = currencySymbols[currency] || currency;

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Sanitize filename for upload
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9.\-_]/gi, '_')
    .toLowerCase();
}
