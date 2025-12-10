import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Watch } from '../types/inventory';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { ComparisonButton } from './ComparisonButton';
import { ViewCounter } from './ViewCounter';
import { LowStockBadge } from './LowStockBadge';
import { useWatch } from '../context/WatchContext';
import inventoryData from '../data/inventory.json';

interface ProductGridProps {
  limit?: number;
}

// Import watch images
import watch1 from 'figma:asset/40ddce25e816838294d1702c319704a8686dc645.png';
import watch2 from 'figma:asset/6510649f53fe69f45ad70939a1f203e84b49a615.png';
import watch3 from 'figma:asset/f8dc7777327b42afd15eb4819ba6c3a3eab8abc9.png';
import watch4 from 'figma:asset/07f1147c0f25ede9aa338ba9c51e437a4cac912f.png';
import watch5 from 'figma:asset/cf97d32c2fc387c6addf7f4fae6f30eb5bd24553.png';
import watch6 from 'figma:asset/63c9d5a6a2098633b091967e690527819dc1c029.png';
import watch7 from 'figma:asset/0c9155e42b382419879c00270bf1f4e926f38d64.png';
import watch8 from 'figma:asset/390f92a85bda9c4472f78caeb066537cb2e19721.png';

// Map image imports to watch IDs
const imageMap: Record<string, string> = {
  'watch-001': watch1,
  'watch-002': watch2,
  'watch-003': watch3,
  'watch-004': watch4,
  'watch-005': watch5,
  'watch-006': watch6,
  'watch-007': watch7,
  'watch-008': watch8,
};

export function ProductGrid({ limit }: ProductGridProps) {
  const [watches, setWatches] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const { formatPrice } = useWatch();

  // Load watches from localStorage or JSON
  useEffect(() => {
    // Load from both inventory.json and localStorage
    Promise.all([
      Promise.resolve(inventoryData),
      new Promise<any[]>(resolve => {
        const stored = localStorage.getItem('manila-watch-inventory');
        resolve(stored ? JSON.parse(stored) : []);
      })
    ]).then(([inventory, stored]) => {
      const allWatches = [...inventory, ...stored].map((watch: any) => ({
        ...watch,
        image: imageMap[watch.id] || watch.images[0],
      }));
      setWatches(allWatches);
      
      // Restore filter state
      const savedFilters = localStorage.getItem('manila-watch-filters');
      if (savedFilters) {
        const { category, brand, price } = JSON.parse(savedFilters);
        setSelectedCategory(category || 'All');
        setSelectedBrand(brand || 'All');
        setPriceRange(price || 'All');
      }
    });
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
    return categoryMatch && brandMatch && priceMatch;
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
              <h3 className="text-3xl mb-2 text-white">Curated Collection</h3>
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
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37] rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-300">Filters</span>
          </motion.button>
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
            className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-[#D4AF37] transition-all"
          >
            <Link to={`/watch/${watch.slug}`} className="block relative">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <FavoriteButton watchId={watch.id} />
                <ShareButton slug={watch.slug} watchName={watch.name} />
              </div>
              <div className="relative overflow-hidden">
                <img
                  src={watch.image}
                  alt={watch.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4">
                  <LowStockBadge tier={watch.tier} availability={watch.availability} />
                </div>
              </div>
            </Link>

            <div className="p-6">
              <Link to={`/watch/${watch.slug}`}>
                <p className="text-sm text-[#D4AF37] mb-2">{watch.brand}</p>
                <h3 className="text-xl text-white mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                  {watch.name}
                </h3>
                <p className="text-2xl text-[#D4AF37] mb-4">
                  {formatPrice(watch.price_php)}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <ViewCounter watchId={watch.id} />
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