import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchExchangeRates, convertPrice, formatCurrency, initializeCurrency, type ExchangeRates } from '../lib/currency';

interface Watch {
  id: string;
  name: string;
  brand: string;
  model: string;
  reference: string;
  price_php: number;
  images: string[];
  slug: string;
}

interface WatchContextType {
  favorites: string[];
  addFavorite: (watchId: string) => void;
  removeFavorite: (watchId: string) => void;
  isFavorite: (watchId: string) => boolean;

  comparison: string[];
  addToComparison: (watchId: string) => void;
  removeFromComparison: (watchId: string) => void;
  clearComparison: () => void;
  isInComparison: (watchId: string) => boolean;

  recentlyViewed: string[];
  addToRecentlyViewed: (watchId: string) => void;

  viewCounts: Record<string, number>;
  incrementViewCount: (watchId: string) => void;

  // Enhanced currency system
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRates: ExchangeRates | null;
  convertPrice: (priceInPHP: number) => number;
  formatPrice: (priceInPHP: number) => string;
  isLoadingRates: boolean;

  // Legacy compatibility
  currencyMode: 'PHP' | 'USD';
  toggleCurrency: () => void;
  exchangeRate: number;
}

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export function WatchProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('manila-watch-favorites', []);
  const [comparison, setComparison] = useLocalStorage<string[]>('manila-watch-comparison', []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<string[]>('manila-watch-recent', []);
  const [viewCounts, setViewCounts] = useLocalStorage<Record<string, number>>('manila-watch-views', {});
  const [currencyMode, setCurrencyMode] = useLocalStorage<'PHP' | 'USD'>('manila-watch-currency', 'PHP');

  // Enhanced currency state
  const [currency, setCurrencyState] = useLocalStorage<string>('manila-watch-currency', 'PHP');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const exchangeRate = 0.018; // Legacy: 1 PHP = 0.018 USD (approximate)

  // Initialize currency and fetch exchange rates
  useEffect(() => {
    async function initialize() {
      try {
        // Auto-detect or load saved currency
        const initialCurrency = await initializeCurrency();
        setCurrencyState(initialCurrency);

        // Fetch exchange rates
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to initialize currency:', error);
      } finally {
        setIsLoadingRates(false);
      }
    }

    initialize();

    // Refresh rates every hour
    const interval = setInterval(async () => {
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to refresh exchange rates:', error);
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  // Currency conversion functions
  const convertPriceFunc = (priceInPHP: number): number => {
    if (!exchangeRates) return priceInPHP;
    return convertPrice(priceInPHP, currency, exchangeRates.rates);
  };

  const formatPriceFunc = (priceInPHP: number): string => {
    const converted = convertPriceFunc(priceInPHP);
    return formatCurrency(converted, currency);
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('manila-watch-currency', newCurrency);
  };
  
  // Favorites
  const addFavorite = (watchId: string) => {
    setFavorites(prev => [...new Set([...prev, watchId])]);
  };
  
  const removeFavorite = (watchId: string) => {
    setFavorites(prev => prev.filter(id => id !== watchId));
  };
  
  const isFavorite = (watchId: string) => favorites.includes(watchId);
  
  // Comparison (max 3)
  const addToComparison = (watchId: string) => {
    if (comparison.length >= 3) return;
    setComparison(prev => [...new Set([...prev, watchId])]);
  };
  
  const removeFromComparison = (watchId: string) => {
    setComparison(prev => prev.filter(id => id !== watchId));
  };
  
  const clearComparison = () => {
    setComparison([]);
  };
  
  const isInComparison = (watchId: string) => comparison.includes(watchId);
  
  // Recently Viewed (max 8)
  const addToRecentlyViewed = (watchId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== watchId);
      return [watchId, ...filtered].slice(0, 8);
    });
  };
  
  // View Counts
  const incrementViewCount = (watchId: string) => {
    setViewCounts(prev => ({
      ...prev,
      [watchId]: (prev[watchId] || 0) + 1
    }));
  };
  
  // Currency Toggle
  const toggleCurrency = () => {
    setCurrencyMode(prev => prev === 'PHP' ? 'USD' : 'PHP');
  };
  
  return (
    <WatchContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      comparison,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      recentlyViewed,
      addToRecentlyViewed,
      viewCounts,
      incrementViewCount,
      // Enhanced currency
      currency,
      setCurrency,
      exchangeRates,
      convertPrice: convertPriceFunc,
      formatPrice: formatPriceFunc,
      isLoadingRates,
      // Legacy compatibility
      currencyMode,
      toggleCurrency,
      exchangeRate
    }}>
      {children}
    </WatchContext.Provider>
  );
}

export function useWatch() {
  const context = useContext(WatchContext);
  if (context === undefined) {
    throw new Error('useWatch must be used within a WatchProvider');
  }
  return context;
}
