import { Eye } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { formatViewCount } from '../utils/currency';

interface ViewCounterProps {
  watchId: string;
  className?: string;
}

export function ViewCounter({ watchId, className = '' }: ViewCounterProps) {
  const { viewCounts } = useWatch();
  const count = viewCounts[watchId] || Math.floor(Math.random() * 500) + 50; // Simulated base count

  return (
    <div className={`flex items-center gap-1 text-sm text-neutral-500 ${className}`}>
      <Eye className="w-4 h-4" />
      <span>{formatViewCount(count)} views</span>
    </div>
  );
}
