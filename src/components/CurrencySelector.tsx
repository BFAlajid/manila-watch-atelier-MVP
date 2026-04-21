import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_CURRENCIES, type Currency } from '../lib/currency';

interface CurrencySelectorProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
  className?: string;
}

export function CurrencySelector({ currentCurrency, onCurrencyChange, className = '' }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentCurrencyData = SUPPORTED_CURRENCIES.find(c => c.code === currentCurrency);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(search.toLowerCase()) ||
    currency.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.currency-selector')) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (currency: Currency) => {
    onCurrencyChange(currency.code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`currency-selector relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Currency: ${currentCurrencyData?.name || currentCurrency}. Click to change.`}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-white motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <span className="text-lg" aria-hidden="true">{currentCurrencyData?.flag}</span>
        <span className="font-medium text-white">{currentCurrency}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-300 motion-safe:transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-neutral-800">
              <input
                type="text"
                placeholder="Search currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                autoFocus
              />
            </div>

            {/* Currency List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCurrencies.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">
                  No currencies found
                </div>
              ) : (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleSelect(currency)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800 transition-colors ${
                      currency.code === currentCurrency ? 'bg-neutral-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">{currency.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-white">{currency.code}</p>
                        <p className="text-sm text-neutral-400">{currency.name}</p>
                      </div>
                    </div>
                    {currency.code === currentCurrency && (
                      <Check className="w-5 h-5 text-[#D4AF37]" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer Note */}
            <div className="p-3 border-t border-neutral-800 text-xs text-neutral-500">
              Exchange rates updated hourly
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
