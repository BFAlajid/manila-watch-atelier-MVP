import { X, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWatch } from '../context/WatchContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Watch {
  id: string;
  name: string;
  brand: string;
  price_php: number;
  images: string[];
  slug: string;
}

export function ComparisonBar() {
  const { comparison, removeFromComparison, clearComparison } = useWatch();
  const [watches, setWatches] = useState<Watch[]>([]);

  useEffect(() => {
    if (comparison.length === 0) {
      setWatches([]);
      return;
    }

    // Load watch data
    Promise.all([
      fetch('/data/inventory.json').then(r => r.json()),
      new Promise<Watch[]>(resolve => {
        const stored = localStorage.getItem('manila-watch-inventory');
        resolve(stored ? JSON.parse(stored) : []);
      })
    ]).then(([inventoryData, storedData]) => {
      const allWatches = [...inventoryData, ...storedData];
      const selectedWatches = allWatches.filter((w: Watch) => comparison.includes(w.id));
      setWatches(selectedWatches);
    });
  }, [comparison]);

  if (comparison.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-[#D4AF37]/20 z-30"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <GitCompare className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white">
                Compare ({comparison.length}/3)
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-2xl overflow-x-auto">
              {watches.map((watch) => (
                <div
                  key={watch.id}
                  className="flex items-center gap-2 bg-neutral-900 rounded-lg px-3 py-2 min-w-fit"
                >
                  <img
                    src={watch.images[0]}
                    alt={watch.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {watch.brand} {watch.name.split(' ').slice(0, 3).join(' ')}
                  </span>
                  <button
                    onClick={() => removeFromComparison(watch.id)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/compare"
                className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors"
              >
                Compare Now
              </Link>
              <button
                onClick={clearComparison}
                className="text-neutral-400 hover:text-white"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
