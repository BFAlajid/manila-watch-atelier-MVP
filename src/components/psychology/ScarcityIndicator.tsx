import { motion, AnimatePresence } from 'motion/react';
import { Flame, Users, Clock, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ScarcityIndicatorProps {
  tier: string;
  watchId: string;
  availability?: string;
}

export function ScarcityIndicator({ tier, watchId, availability }: ScarcityIndicatorProps) {
  const [viewing, setViewing] = useState(0);
  const [recentInquiries, setRecentInquiries] = useState(0);

  // Simulate realistic viewing/inquiry numbers
  useEffect(() => {
    // Random but consistent per watch
    const seed = watchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseViewing = (seed % 5) + 1; // 1-5 people
    const baseInquiries = (seed % 15) + 5; // 5-19 inquiries

    setViewing(baseViewing);
    setRecentInquiries(baseInquiries);

    // Fluctuate viewing count slightly
    const interval = setInterval(() => {
      setViewing(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, Math.min(8, prev + change));
      });
    }, 8000 + Math.random() * 4000); // 8-12 seconds

    return () => clearInterval(interval);
  }, [watchId]);

  if (tier !== 'A') return null; // Only show for Tier A (in stock)

  return (
    <div className="space-y-2">
      {/* Live Viewers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewing}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-2 text-xs"
        >
          <div className="relative">
            <Users className="w-4 h-4 text-orange-500" />
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-neutral-400">
            {viewing} {viewing === 1 ? 'person' : 'people'} viewing now
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Recent Inquiries */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-xs"
      >
        <TrendingUp className="w-4 h-4 text-green-500" />
        <span className="text-neutral-400">
          {recentInquiries} inquiries this week
        </span>
      </motion.div>

      {/* Urgency for high demand */}
      {viewing >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-xs"
        >
          <Flame className="w-4 h-4 text-red-500" />
          <span className="text-red-400 font-medium">
            High demand - Act fast!
          </span>
        </motion.div>
      )}
    </div>
  );
}
