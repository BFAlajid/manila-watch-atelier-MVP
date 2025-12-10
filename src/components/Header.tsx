import { Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SearchBar } from './SearchBar';
import { CurrencyToggle } from './CurrencyToggle';
import { CurrencySelector } from './CurrencySelector';
import { ThemeToggle } from './ThemeToggle';
import { useWatch } from '../context/WatchContext';

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
          {/* Logo */}
          <Link to="/">
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <h1 className="text-2xl tracking-tight cursor-pointer text-white">
                MANILA WATCH<span className="font-light text-[#D4AF37]"> ATELIER</span>
              </h1>
            </motion.div>
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

            <ThemeToggle />

            <Link to="/favorites" className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-neutral-300 hover:text-[#D4AF37] transition-colors"
              >
                <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                <AnimatePresence>
                  {favorites.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      {favorites.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>
            
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 text-neutral-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-neutral-800"
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
