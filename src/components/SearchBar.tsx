import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useWatch } from '../context/WatchContext';

interface Watch {
  id: string;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  name: string;
  price_php: number;
  images: string[];
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Watch[]>([]);
  const [allWatches, setAllWatches] = useState<Watch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useWatch();

  // Load watches
  useEffect(() => {
    Promise.all([
      fetch('/data/inventory.json').then(r => r.json()),
      new Promise<Watch[]>(resolve => {
        const stored = localStorage.getItem('manila-watch-inventory');
        resolve(stored ? JSON.parse(stored) : []);
      })
    ]).then(([inventoryData, storedData]) => {
      setAllWatches([...inventoryData, ...storedData]);
    });
  }, []);

  // Keyboard shortcut (Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = allWatches.filter(watch => 
      watch.brand.toLowerCase().includes(searchQuery) ||
      watch.model.toLowerCase().includes(searchQuery) ||
      watch.name.toLowerCase().includes(searchQuery) ||
      watch.reference.toLowerCase().includes(searchQuery) ||
      watch.price_php.toString().includes(searchQuery)
    );

    setResults(filtered.slice(0, 8));
  }, [query, allWatches]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-[#D4AF37] transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm text-neutral-400">Search watches...</span>
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-neutral-800 rounded">⌘K</kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
                  <Search className="w-5 h-5 text-neutral-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by brand, model, reference, or price..."
                    className="flex-1 bg-transparent text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <button
                    onClick={handleClose}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((watch) => (
                      <Link
                        key={watch.id}
                        to={`/watch/${watch.slug}`}
                        onClick={handleClose}
                        className="flex items-center gap-4 p-4 hover:bg-neutral-800 transition-colors"
                      >
                        <img
                          src={watch.images[0]}
                          alt={watch.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-[#D4AF37]">{watch.brand}</p>
                          <h4 className="text-white">{watch.name}</h4>
                          <p className="text-sm text-neutral-400">{watch.reference}</p>
                        </div>
                        <p className="text-[#D4AF37]">
                          {formatPrice(watch.price_php)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {query && results.length === 0 && (
                  <div className="p-8 text-center text-neutral-400">
                    No watches found for "{query}"
                  </div>
                )}

                {/* Hints */}
                {!query && (
                  <div className="p-4 text-sm text-neutral-500">
                    <p>Try searching for: Rolex, Submariner, 126610, or a price range</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
