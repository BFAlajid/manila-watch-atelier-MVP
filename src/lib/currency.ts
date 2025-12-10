// Real-time currency conversion system
// Uses exchangerate-api.io for live exchange rates

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

// Supported currencies with symbols and flags
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' }
];

const CACHE_KEY = 'manila-watch-exchange-rates';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const API_URL = 'https://api.exchangerate-api.io/v4/latest/PHP';

// Fallback rates in case API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  PHP: 1,
  USD: 0.018,
  EUR: 0.016,
  GBP: 0.014,
  JPY: 2.68,
  CNY: 0.13,
  KRW: 24.5,
  SGD: 0.024,
  HKD: 0.14,
  AUD: 0.028,
  CAD: 0.025,
  CHF: 0.016,
  THB: 0.63,
  MYR: 0.081,
  IDR: 285,
  VND: 455,
  INR: 1.52,
  AED: 0.066,
  SAR: 0.067,
  NZD: 0.031
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: ExchangeRates = JSON.parse(cached);
      const now = Date.now();

      // Return cached rates if less than 1 hour old
      if (now - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Fetch fresh rates
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    const rates: ExchangeRates = {
      base: 'PHP',
      rates: data.rates,
      timestamp: Date.now()
    };

    // Cache the rates
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback:', error);

    // Return fallback rates
    return {
      base: 'PHP',
      rates: FALLBACK_RATES,
      timestamp: Date.now()
    };
  }
}

export function convertPrice(
  priceInPHP: number,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  const rate = rates[targetCurrency] || 1;
  return priceInPHP * rate;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);

  if (!currency) {
    return `${amount.toLocaleString()} ${currencyCode}`;
  }

  // Special formatting for certain currencies
  if (currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'IDR' || currencyCode === 'VND') {
    // No decimals for these currencies
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

export function detectUserCurrency(): string {
  // Try to detect from timezone/locale
  try {
    const locale = navigator.language || 'en-US';

    const currencyMap: Record<string, string> = {
      'en-PH': 'PHP',
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-AU': 'AUD',
      'en-CA': 'CAD',
      'en-NZ': 'NZD',
      'en-SG': 'SGD',
      'en-HK': 'HKD',
      'ja-JP': 'JPY',
      'ko-KR': 'KRW',
      'zh-CN': 'CNY',
      'th-TH': 'THB',
      'ms-MY': 'MYR',
      'id-ID': 'IDR',
      'vi-VN': 'VND',
      'hi-IN': 'INR',
      'ar-AE': 'AED',
      'ar-SA': 'SAR',
      'de-DE': 'EUR',
      'fr-FR': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'de-CH': 'CHF'
    };

    const detected = currencyMap[locale];
    if (detected) return detected;

    // Fallback to country code
    const country = locale.split('-')[1];
    if (country === 'PH') return 'PHP';
    if (country === 'US') return 'USD';
  } catch (error) {
    console.error('Error detecting currency:', error);
  }

  // Default to PHP
  return 'PHP';
}

export async function initializeCurrency(): Promise<string> {
  // Check if user has a saved preference
  const saved = localStorage.getItem('manila-watch-currency');
  if (saved && SUPPORTED_CURRENCIES.some(c => c.code === saved)) {
    return saved;
  }

  // Auto-detect from locale
  const detected = detectUserCurrency();
  localStorage.setItem('manila-watch-currency', detected);
  return detected;
}
