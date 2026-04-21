import { useEffect, useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { FavoriteButton } from '../components/FavoriteButton';
import { motion } from 'motion/react';
import { fetchWatches } from '../lib/api';

interface Watch {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  price_php: number;
  images: string[];
  tier: string;
}

export default function FavoritesPage() {
  const { favorites, formatPrice } = useWatch();
  const [watches, setWatches] = useState<Watch[]>([]);

  useEffect(() => {
    if (favorites.length === 0) {
      setWatches([]);
      return;
    }

    let cancelled = false;
    fetchWatches()
      .then((allWatches) => {
        if (cancelled) return;
        const favoriteWatches = allWatches.filter((w: Watch) => favorites.includes(w.id));
        setWatches(favoriteWatches);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load watches for favorites page:', err);
      });
    return () => { cancelled = true; };
  }, [favorites]);

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/inventory" className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#D4AF37] mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
            <h1 className="text-3xl mb-4">No Favorites Yet</h1>
            <p className="text-neutral-400 mb-8">Start adding watches to your favorites to see them here</p>
            <Link to="/inventory" className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors inline-block">
              Browse Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link to="/inventory" className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#D4AF37] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]" />
          <h1 className="text-4xl">My Favorites</h1>
          <span className="text-neutral-400">({watches.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {watches.map((watch, index) => (
            <motion.div
              key={watch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-[#D4AF37] transition-all group"
            >
              <Link to={`/watch/${watch.slug}`} className="block relative">
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton watchId={watch.id} />
                </div>
                <img
                  src={watch.images[0]}
                  alt={watch.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-6">
                <Link to={`/watch/${watch.slug}`}>
                  <p className="text-sm text-[#D4AF37] mb-2">{watch.brand}</p>
                  <h3 className="text-xl mb-3 group-hover:text-[#D4AF37] transition-colors">
                    {watch.name}
                  </h3>
                  <p className="text-2xl text-[#D4AF37] mb-4">
                    {formatPrice(watch.price_php)}
                  </p>
                  <span className="inline-block px-3 py-1 bg-neutral-800 rounded-full text-sm">
                    {watch.tier === 'A' ? 'In Hand' : watch.tier === 'B' ? 'Incoming' : 'On Demand'}
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
