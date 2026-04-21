import { Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SearchBar } from './SearchBar';
import { CurrencyToggle } from './CurrencyToggle';
import { CurrencySelector } from './CurrencySelector';
import { useWatch } from '../context/WatchContext';
import { IconButton } from './ui/IconButton';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { favorites, currency, setCurrency } = useWatch();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Favorites', path: '/favorites' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-lg border-neutral-800 shadow-lg'
          : 'bg-black border-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo — decorative wordmark, not a page heading. Each route owns its own <h1>. */}
          <Link to="/" aria-label="Manila Watch Atelier — Home">
            <div className="flex-shrink-0">
              <span className="block text-2xl tracking-tight text-white motion-safe:transition-opacity hover:opacity-90">
                MANILA WATCH<span className="font-light text-[#D4AF37]"> ATELIER</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  to={item.path}
                  className={`relative group ${
                    location.pathname === item.path
                      ? 'text-[#D4AF37]'
                      : 'text-neutral-300 hover:text-white'
                  } transition-colors`}
                >
                  {item.name}
                  <motion.span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37] ${
                      location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                    } transition-all duration-300`}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>

            <CurrencySelector
              currentCurrency={currency}
              onCurrencyChange={setCurrency}
              className="hidden md:block"
            />

            <Link
              to="/favorites"
              aria-label={favorites.length > 0 ? `View favorites (${favorites.length})` : 'View favorites'}
              className="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg text-neutral-300 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:transition-colors"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} aria-hidden="true" />
              <AnimatePresence>
                {favorites.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center motion-reduce:transition-none"
                  >
                    {favorites.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <IconButton
              label={isMenuOpen ? 'Close menu' : 'Open menu'}
              icon={isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              variant="ghost"
              size="md"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-neutral-800 motion-reduce:transition-none"
            >
              <nav className="flex flex-col py-4 space-y-4">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`block ${
                        location.pathname === item.path
                          ? 'text-[#D4AF37]'
                          : 'text-neutral-300 hover:text-white'
                      } transition-colors`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="pt-4">
                  <SearchBar />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
