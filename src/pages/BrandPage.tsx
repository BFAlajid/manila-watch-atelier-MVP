import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

const brandDescriptions: Record<string, { name: string; description: string; tagline: string }> = {
  rolex: {
    name: 'Rolex',
    tagline: 'The Crown Standard',
    description:
      'Rolex is the most recognized luxury watch brand in the world — and for good reason. Every reference holds its value, many appreciate significantly in the grey market, and the brand\'s build quality is unmatched at any price point. From the Submariner to the Daytona, Rolex sports models remain the most liquid assets in the secondary watch market. We source Rolex pieces with complete sets (box, papers, warranty card) from trusted suppliers across Southeast Asia.',
  },
  'patek-philippe': {
    name: 'Patek Philippe',
    tagline: 'You Never Actually Own a Patek Philippe',
    description:
      'Patek Philippe represents the pinnacle of Swiss watchmaking. The Nautilus and Aquanaut command extraordinary premiums in the secondary market, while the Calatrava and Grand Complications showcase centuries of horological mastery. Patek is the only brand where virtually every reference appreciates over time. Sourcing Patek in the Philippines requires patience and trusted connections — we have both.',
  },
  'audemars-piguet': {
    name: 'Audemars Piguet',
    tagline: 'The Art of the Royal Oak',
    description:
      'Audemars Piguet\'s Royal Oak, designed by Gerald Genta in 1972, revolutionized luxury watchmaking by proving that a steel sports watch could command precious metal prices. The octagonal bezel with exposed screws, the "Grande Tapisserie" dial pattern, and the integrated bracelet are instantly recognizable. AP\'s hand-finishing rivals brands twice its price. The Royal Oak remains one of the "Holy Trinity" of watches.',
  },
  omega: {
    name: 'Omega',
    tagline: 'The First Watch on the Moon',
    description:
      'Omega offers the best value proposition in luxury watchmaking. The Speedmaster Professional — the Moonwatch — is a piece of human history on your wrist. The Seamaster 300M is James Bond\'s choice. With METAS-certified Co-Axial Master Chronometer movements and prices well below Rolex, Omega is where smart collectors start. The brand has been appreciating steadily in the grey market, particularly vintage references.',
  },
  cartier: {
    name: 'Cartier',
    tagline: 'The Jeweler of Kings',
    description:
      'Cartier created the wristwatch. The Santos, designed for aviator Alberto Santos-Dumont in 1904, is the original pilot\'s watch. The Tank is one of the most iconic designs in all of fashion. Cartier watches are about design, heritage, and elegance — not complications or depth ratings. The 2023 Tank Francaise redesign has created a surge in demand that mirrors Rolex allocation behavior.',
  },
  tudor: {
    name: 'Tudor',
    tagline: 'Born to Dare',
    description:
      'Tudor is Rolex\'s sister brand, offering in-house movements manufactured to Rolex standards at a fraction of the price. The Black Bay Fifty-Eight at 39mm is the most popular Tudor reference and has been steadily appreciating. The Pelagos in titanium is one of the most capable dive watches under ₱250k. For collectors who want serious watchmaking without the Rolex premium, Tudor is the answer.',
  },
};

export default function BrandPage() {
  const { brand: brandSlug } = useParams();
  const [watches, setWatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const brandInfo = brandSlug ? brandDescriptions[brandSlug] : null;

  useEffect(() => {
    if (!brandInfo) return;

    const fetchWatches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/watches?brand=${encodeURIComponent(brandInfo.name)}`);
        if (response.ok) {
          const data = await response.json();
          setWatches(data);
        }
      } catch (error) {
        console.error('Error fetching brand watches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, [brandInfo]);

  if (!brandInfo) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl mb-4">Brand Not Found</h1>
          <Link to="/inventory" className="text-[#D4AF37] hover:underline">
            Browse All Watches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#D4AF37] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All Watches
          </Link>

          {/* Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-2">
              {brandInfo.tagline}
            </p>
            <h1 className="text-5xl font-light mb-6">{brandInfo.name}</h1>
            <p className="text-neutral-400 leading-relaxed max-w-3xl">
              {brandInfo.description}
            </p>
          </motion.div>

          {/* Watch Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-500 mb-8"
          >
            {loading ? 'Loading...' : `${watches.length} ${watches.length === 1 ? 'timepiece' : 'timepieces'} available`}
          </motion.p>

          {/* Watch Grid */}
          {!loading && watches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {watches.map((watch, index) => (
                <motion.div
                  key={watch.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-[#D4AF37] transition-all"
                >
                  <Link to={`/watch/${watch.slug}`} className="block">
                    <div className="relative overflow-hidden bg-black">
                      {watch.images?.[0] && (
                        <img
                          src={watch.images[0]}
                          alt={`${watch.brand} ${watch.model} Ref. ${watch.reference}${watch.dialColor ? ` ${watch.dialColor}` : ''}${watch.caseMaterial ? ` ${watch.caseMaterial}` : ''}`}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {watch.status === 'RESERVED' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-yellow-400 text-lg font-medium border border-yellow-400 px-4 py-2 rounded">
                            Reserved
                          </span>
                        </div>
                      )}
                      {watch.status === 'SOLD' && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-red-400 text-lg font-medium border border-red-400 px-4 py-2 rounded">
                            Sold
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-[#D4AF37] mb-2">{watch.brand}</p>
                      <h3 className="text-xl text-white mb-1 group-hover:text-[#D4AF37] transition-colors">
                        {watch.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-3">Ref. {watch.reference}</p>
                      <p className="text-2xl text-[#D4AF37]">
                        ₱{(watch.pricePHP || watch.price_php)?.toLocaleString()}
                      </p>
                      {watch.marketTrend && (
                        <p className={`text-xs mt-2 ${
                          watch.marketTrend === 'APPRECIATING'
                            ? 'text-green-400'
                            : watch.marketTrend === 'DEPRECIATING'
                            ? 'text-red-400'
                            : 'text-neutral-500'
                        }`}>
                          {watch.marketTrend === 'APPRECIATING' && '↑'}
                          {watch.marketTrend === 'DEPRECIATING' && '↓'}
                          {watch.marketTrend === 'STABLE' && '→'}
                          {' '}{watch.marketTrend}
                          {watch.annualAppreciation ? ` (${watch.annualAppreciation > 0 ? '+' : ''}${watch.annualAppreciation}%/yr)` : ''}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && watches.length === 0 && (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg mb-4">
                No {brandInfo.name} watches currently available.
              </p>
              <Link
                to="/inventory"
                className="text-[#D4AF37] hover:underline"
              >
                Browse all watches
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
