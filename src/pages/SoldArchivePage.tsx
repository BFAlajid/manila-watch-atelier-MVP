import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useWatch } from '../context/WatchContext';
import { Award } from 'lucide-react';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface SoldWatch {
  id: string;
  slug: string;
  brand: string;
  name: string;
  model: string;
  reference: string;
  price_php: number;
  images: string[];
  condition: string;
  status: string;
  sold_at?: string;
  updated_at?: string;
}

export default function SoldArchivePage() {
  const [watches, setWatches] = useState<SoldWatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useWatch();

  useEffect(() => {
    fetch(`${API_BASE_URL}/watches?status=ALL`)
      .then(r => r.json())
      .then(data => {
        const sold = data.filter((w: SoldWatch) => w.status === 'SOLD');
        setWatches(sold);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-sm tracking-widest text-[#D4AF37] uppercase mb-3">Previously Sold</p>
          <h1 className="text-5xl text-white mb-4 font-serif">Sold Archive</h1>
          <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-4" />
          <p className="text-xl text-neutral-400">
            A showcase of exceptional timepieces that found their new homes
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-neutral-900 rounded-xl overflow-hidden animate-pulse">
                <div className="h-72 bg-neutral-800" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-neutral-800 rounded w-1/3" />
                  <div className="h-5 bg-neutral-800 rounded w-2/3" />
                  <div className="h-6 bg-neutral-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : watches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Award className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg mb-2">No sold watches yet</p>
            <p className="text-neutral-500 mb-8">All current inventory is still available!</p>
            <Link
              to="/inventory"
              className="inline-block px-8 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors"
            >
              Browse Available Watches
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {watches.map((watch, index) => (
              <motion.div
                key={watch.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 relative"
              >
                {/* SOLD banner */}
                <div className="absolute top-4 right-4 z-10 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Sold
                </div>

                <div className="relative overflow-hidden">
                  {watch.images?.[0] ? (
                    <img
                      src={watch.images[0]}
                      alt={watch.name}
                      loading="lazy"
                      className="w-full h-72 object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-72 flex items-center justify-center bg-neutral-800">
                      <svg className="w-16 h-16 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.5" /><path strokeWidth="1.5" d="M12 7v5l3 3" /></svg>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />

                <div className="p-6">
                  <p className="text-sm text-neutral-500 mb-1">{watch.brand}</p>
                  <h3 className="text-lg text-white mb-2">{watch.name}</h3>
                  <p className="text-neutral-500 line-through text-lg">
                    {formatPrice(watch.price_php)}
                  </p>
                  {watch.updated_at && (
                    <p className="text-xs text-neutral-600 mt-3">
                      Sold {new Date(watch.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
