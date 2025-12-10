import { GitCompare } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { toast } from 'sonner@2.0.3';

interface ComparisonButtonProps {
  watchId: string;
  className?: string;
}

export function ComparisonButton({ watchId, className = '' }: ComparisonButtonProps) {
  const { isInComparison, addToComparison, removeFromComparison, comparison } = useWatch();
  const inComparison = isInComparison(watchId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inComparison) {
      removeFromComparison(watchId);
      toast.success('Removed from comparison');
    } else {
      if (comparison.length >= 3) {
        toast.error('Maximum 3 watches for comparison');
        return;
      }
      addToComparison(watchId);
      toast.success('Added to comparison');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 text-sm ${inComparison ? 'text-[#D4AF37]' : 'text-neutral-600 hover:text-[#D4AF37]'} transition-colors ${className}`}
      title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
    >
      <GitCompare className="w-4 h-4" />
      <span className="text-sm">Compare</span>
    </button>
  );
}
