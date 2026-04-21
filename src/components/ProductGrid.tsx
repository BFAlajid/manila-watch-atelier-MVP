import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Watch } from '../types/inventory';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { ComparisonButton } from './ComparisonButton';
import { LowStockBadge } from './LowStockBadge';
import { useWatch } from '../context/WatchContext';

// API configuration
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

interface ProductGridProps {
  limit?: number;
}

// No longer using static image imports - all images uploaded via admin

export function ProductGrid({ limit }: ProductGridProps) {
  const [watches, setWatches] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { formatPrice } = useWatch();

  // Load watches from API. Refreshes on:
  //   - Mount (initial load)
  //   - Tab regains focus (user comes back from admin / another tab)
  //   - Every 30s polling while the tab is visible
  // Admin changes (marking SOLD, price edits) propagate within ~10s edge cache
  // + this revalidation cycle, so buyers never see stale stock.
  useEffect(() => {
    let cancelled = false;
    let isFirstLoad = true;

    const loadWatches = async () => {
      try {
        // Cache-bust by adding a query param only when the user just returned
        // to the tab — forces a fresh origin hit past the edge cache.
        const response = await fetch(`${API_BASE_URL}/watches`, { cache: 'no-cache' });
        if (!response.ok) throw new Error('Failed to load inventory');
        const inventory = await response.json();
        if (cancelled) return;

        const watchesWithImages = inventory.map((watch: any) => ({
          ...watch,
          image: watch.images && watch.images.length > 0 ? watch.images[0] : '',
        }));
        setWatches(watchesWithImages);

        if (isFirstLoad) {
          const savedFilters = localStorage.getItem('manila-watch-filters');
          if (savedFilters) {
            const { category, brand, price } = JSON.parse(savedFilters);
            setSelectedCategory(category || 'All');
            setSelectedBrand(brand || 'All');
            setPriceRange(price || 'All');
          }
          isFirstLoad = false;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading watches:', error);
          setWatches([]);
        }
      }
    };

    loadWatches();

    // Revalidate when the tab becomes visible again.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadWatches();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', loadWatches);

    // Gentle background polling every 30s while the tab is visible.
    const pollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadWatches();
    }, 30_000);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', loadWatches);
      window.clearInterval(pollId);
    };
  }, []);

  // Save filter state
  useEffect(() => {
    localStorage.setItem('manila-watch-filters', JSON.stringify({
      category: selectedCategory,
      brand: selectedBrand,
      price: priceRange
    }));
  }, [selectedCategory, selectedBrand, priceRange]);

  const categories = ['All', 'Sport', 'Luxury', 'Dress'];
  const brands = ['All', ...Array.from(new Set(watches.map(w => w.brand)))];
  const priceRanges = [
    { label: 'All', min: 0, max: Infinity },
    { label: 'Under ₱1M', min: 0, max: 1000000 },
    { label: '₱1M - ₱2M', min: 1000000, max: 2000000 },
    { label: '₱2M - ₱4M', min: 2000000, max: 4000000 },
    { label: 'Over ₱4M', min: 4000000, max: Infinity },
  ];

  const filteredWatches = watches.filter(watch => {
    const categoryMatch = selectedCategory === 'All' || watch.category === selectedCategory;
    const brandMatch = selectedBrand === 'All' || watch.brand === selectedBrand;
    const priceRangeObj = priceRanges.find(pr => pr.label === priceRange) || priceRanges[0];
    const priceMatch = watch.price_php >= priceRangeObj.min && watch.price_php <= priceRangeObj.max;
    const q = searchQuery.toLowerCase();
    const searchMatch = !q || watch.brand.toLowerCase().includes(q) || watch.name.toLowerCase().includes(q) || watch.model?.toLowerCase().includes(q) || watch.reference?.toLowerCase().includes(q);
    return categoryMatch && brandMatch && priceMatch && searchMatch;
  });

  const displayWatches = limit ? filteredWatches.slice(0, limit) : filteredWatches;

  return (
    <section id="collection" className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          {!limit && (
            <>
              <h3 className="text-3xl mb-2 text-white font-serif">Curated Collection</h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-neutral-400"
              >
                {displayWatches.length} {displayWatches.length === 1 ? 'timepiece' : 'timepieces'}
              </motion.p>
            </>
          )}
        </div>
        {!limit && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-56 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg text-white placeholder-neutral-500 focus:outline-none transition-all text-sm"
              />
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ y: -1 }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37] rounded-lg motion-safe:transition-colors motion-reduce:transition-none"
            >
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-300">Filters</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {(showFilters && !limit) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-neutral-900 rounded-xl border border-neutral-800">
              {/* Category */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  aria-label="Filter by brand"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  aria-label="Filter by price range"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  {priceRanges.map(range => (
                    <option key={range.label} value={range.label}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayWatches.map((watch, index) => (
          <motion.div
            key={watch.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] transition-all"
          >
            <Link to={`/watch/${watch.slug}`} className="block relative">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <FavoriteButton watchId={watch.id} />
                <ShareButton slug={watch.slug} watchName={watch.name} />
              </div>
              <div className="relative overflow-hidden bg-black">
                {watch.image ? (
                  <img
                    src={watch.image}
                    alt={watch.name}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-80 flex items-center justify-center bg-neutral-800 ${watch.image ? 'hidden' : ''}`}>
                  <svg className="w-16 h-16 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.5" /><path strokeWidth="1.5" d="M12 7v5l3 3" /></svg>
                </div>
                <div className="absolute bottom-4 left-4">
                  <LowStockBadge tier={watch.tier} availability={watch.availability} />
                </div>
              </div>
            </Link>

            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
            <div className="p-6">
              <Link to={`/watch/${watch.slug}`}>
                <p className="text-sm text-[#D4AF37] mb-2">{watch.brand}</p>
                <h3 className="text-xl text-white mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                  {watch.name}
                </h3>
                <p className="text-2xl text-[#D4AF37] mb-4">
                  {formatPrice(watch.price_php)}
                </p>
                
                <div className="flex items-center justify-end mb-4">
                  <span className="text-sm text-neutral-500 capitalize">
                    {watch.condition.replace('_', ' ')}
                  </span>
                </div>
              </Link>

              <ComparisonButton watchId={watch.id} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Link */}
      {limit && filteredWatches.length > limit && (
        <div className="text-center mt-12">
          <Link
            to="/inventory"
            className="inline-block px-8 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors"
          >
            View All Watches
          </Link>
        </div>
      )}
    </section>
  );
}