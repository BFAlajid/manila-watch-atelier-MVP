import { motion, AnimatePresence } from 'motion/react';
import { Package, Eye, ShoppingBag, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FOMOIndicatorProps {
  watchId: string;
  tier: string;
  condition?: string;
  brand: string;
}

type FOMOType = 'recently-acquired' | 'back-in-stock' | 'last-viewed' | 'limited-quantity';

interface FOMOMessage {
  type: FOMOType;
  message: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function FOMOIndicator({ watchId, tier, condition, brand }: FOMOIndicatorProps) {
  const [activeFOMO, setActiveFOMO] = useState<FOMOMessage | null>(null);
  const [showFOMO, setShowFOMO] = useState(true);

  useEffect(() => {
    const seed = watchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed % 100) / 100;

    const fomoMessages: FOMOMessage[] = [];

    // Recently Acquired (for new/unworn watches)
    if ((condition === 'Brand New' || condition === 'Unworn') && random > 0.6) {
      const daysAgo = Math.floor(random * 7) + 1; // 1-7 days ago
      fomoMessages.push({
        type: 'recently-acquired',
        message: `Newly acquired ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
        icon: <Package className="w-4 h-4" />,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      });
    }

    // Back in Stock (for Tier A popular brands)
    if (tier === 'A' && ['Rolex', 'Patek Philippe', 'Audemars Piguet'].includes(brand) && random > 0.3 && random <= 0.5) {
      fomoMessages.push({
        type: 'back-in-stock',
        message: 'Back in stock - Limited availability',
        icon: <ShoppingBag className="w-4 h-4" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      });
    }

    // Last Viewed (simulate recent activity)
    if (random > 0.5 && random <= 0.7) {
      const minutesAgo = Math.floor(random * 60) + 1; // 1-60 minutes
      fomoMessages.push({
        type: 'last-viewed',
        message: `Last viewed ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
        icon: <Eye className="w-4 h-4" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10'
      });
    }

    // Limited Quantity (for Tier A)
    if (tier === 'A' && random > 0.7) {
      fomoMessages.push({
        type: 'limited-quantity',
        message: 'Only 1 piece available',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10'
      });
    }

    // Select the first FOMO message if any exist
    if (fomoMessages.length > 0) {
      setActiveFOMO(fomoMessages[0]);

      // Auto-hide after 10 seconds for "last-viewed" type
      if (fomoMessages[0].type === 'last-viewed') {
        setTimeout(() => setShowFOMO(false), 10000);
      }
    }
  }, [watchId, tier, condition, brand]);

  if (!activeFOMO || !showFOMO) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${activeFOMO.bgColor} ${activeFOMO.color} text-xs font-medium`}
      >
        <motion.span
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {activeFOMO.icon}
        </motion.span>
        <span>{activeFOMO.message}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// RecentActivity Component for Homepage/Sidebar
interface RecentActivityItem {
  watchName: string;
  action: 'viewed' | 'inquired' | 'purchased';
  location: string;
  timeAgo: string;
}

export function RecentActivityFeed() {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);

  useEffect(() => {
    // Generate realistic activity feed
    const generateActivities = (): RecentActivityItem[] => {
      const watches = [
        'Rolex Submariner',
        'Patek Philippe Nautilus',
        'Audemars Piguet Royal Oak',
        'Omega Speedmaster',
        'Rolex Datejust'
      ];

      const locations = [
        'Manila',
        'Singapore',
        'Hong Kong',
        'Dubai',
        'Tokyo',
        'New York'
      ];

      const actions: RecentActivityItem['action'][] = ['viewed', 'inquired', 'purchased'];

      const timeOptions = [
        '2 minutes ago',
        '5 minutes ago',
        '15 minutes ago',
        '1 hour ago',
        '2 hours ago'
      ];

      return Array.from({ length: 5 }, (_, i) => ({
        watchName: watches[Math.floor(Math.random() * watches.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        timeAgo: timeOptions[i]
      }));
    };

    setActivities(generateActivities());

    // Update activities every 30 seconds
    const interval = setInterval(() => {
      setActivities(generateActivities());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getActionConfig = (action: RecentActivityItem['action']) => {
    switch (action) {
      case 'viewed':
        return { icon: <Eye className="w-3 h-3" />, color: 'text-blue-400', label: 'viewed' };
      case 'inquired':
        return { icon: <ShoppingBag className="w-3 h-3" />, color: 'text-yellow-400', label: 'inquired about' };
      case 'purchased':
        return { icon: <Package className="w-3 h-3" />, color: 'text-green-400', label: 'purchased' };
    }
  };

  return (
    <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
      <h3 className="text-sm font-semibold text-neutral-200 mb-3 flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-500 rounded-full"
        />
        Recent Activity
      </h3>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const config = getActionConfig(activity.action);
            return (
              <motion.div
                key={`${activity.watchName}-${activity.timeAgo}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-xs"
              >
                <span className={config.color}>{config.icon}</span>
                <div className="flex-1">
                  <p className="text-neutral-300">
                    Someone from <span className="font-medium text-white">{activity.location}</span>{' '}
                    {config.label}{' '}
                    <span className="font-medium text-[#D4AF37]">{activity.watchName}</span>
                  </p>
                  <p className="text-neutral-500 mt-0.5">{activity.timeAgo}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
