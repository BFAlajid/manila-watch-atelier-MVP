import { DollarSign } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { Button } from './ui/Button';

export function CurrencyToggle() {
  const { currencyMode, toggleCurrency } = useWatch();

  return (
    <Button
      onClick={toggleCurrency}
      variant="secondary"
      size="sm"
      leftIcon={<DollarSign className="w-4 h-4" />}
      title="Toggle currency"
    >
      {currencyMode}
    </Button>
  );
}
