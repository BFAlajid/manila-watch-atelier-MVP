import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LowStockBadgeProps {
  tier: string;
  availability: string;
}

export function LowStockBadge({ tier, availability }: LowStockBadgeProps) {
  // Only show for in-stock items
  if (tier !== 'A' || availability !== 'in_stock') return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg"
    >
      <AlertCircle className="w-4 h-4 text-orange-500" />
      <span className="text-sm text-orange-500">Only 1 available</span>
    </motion.div>
  );
}
