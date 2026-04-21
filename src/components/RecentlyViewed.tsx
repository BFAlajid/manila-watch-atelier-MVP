import { useEffect, useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchWatches } from '../lib/api';

interface Watch {
  id: string;
  slug: string;
  brand: string;
  name: string;
  price_php: number;
  images: string[];
}

interface RecentlyViewedProps {
  currentWatchId?: string;
}

export function RecentlyViewed({ currentWatchId }: RecentlyViewedProps) {
  const { recentlyViewed, formatPrice } = useWatch();
  const [watches, setWatches] = useState<Watch[]>([]);

  useEffect(() => {
    // Filter out current watch and get data
    const viewedIds = recentlyViewed.filter(id => id !== currentWatchId).slice(0, 4);
    
    if (viewedIds.length === 0) {
      setWatches([]);
      return;
    }

    let cancelled = false;
    fetchWatches()
      .then((allWatches) => {
        if (cancelled) return;
        const viewedWatches = viewedIds
          .map((id) => allWatches.find((w: Watch) => w.id === id))
          .filter(Boolean) as Watch[];
        setWatches(viewedWatches);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load watches for recently-viewed:', err);
      });
    return () => { cancelled = true; };
  }, [recentlyViewed, currentWatchId]);

  if (watches.length === 0) return null;

  return (
    <div className="border-t border-neutral-800 pt-12 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-[#D4AF37]" />
        <h3 className="text-xl text-white">Recently Viewed</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {watches.map((watch, index) => (
          <motion.div
            key={watch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/watch/${watch.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-lg mb-3">
                <img
                  src={watch.images[0]}
                  alt={watch.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm text-[#D4AF37] mb-1">{watch.brand}</p>
              <h4 className="text-white mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                {watch.name}
              </h4>
              <p className="text-[#D4AF37]">
                {formatPrice(watch.price_php)}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
