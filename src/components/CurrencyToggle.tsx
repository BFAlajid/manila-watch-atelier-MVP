import { DollarSign } from 'lucide-react';
import { useWatch } from '../context/WatchContext';

export function CurrencyToggle() {
  const { currencyMode, toggleCurrency } = useWatch();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-800 hover:border-[#D4AF37] transition-colors"
      title="Toggle currency"
    >
      <DollarSign className="w-4 h-4" />
      <span className="text-sm">{currencyMode}</span>
    </button>
  );
}
