import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import heroImage1 from 'figma:asset/356ed74642390f964957f56c9c7e341b840be530.png';
import heroImage2 from 'figma:asset/65b443d7a3bf7b902c52cc36db6945d79d4d1f1a.png';
import heroImage3 from 'figma:asset/50d2d3ced0e2dd397b40f90fe14b51495f2b7940.png';
import heroImage4 from 'figma:asset/3c2b8795a92c4b2b191c058220691332d0c5f5de.png';
import heroImage5 from 'figma:asset/a8374bfb8280ce30b87f15764a9aaf76bf6338dc.png';
import heroImage6 from 'figma:asset/09ad94a08f80ddcd0bdc4edd5e14bd84ec860674.png';

const heroImages = [
  { src: heroImage1, alt: 'Rolex Day-Date with green dial' },
  { src: heroImage2, alt: 'Luxury watch collection' },
  { src: heroImage3, alt: 'Watch display showcase' },
  { src: heroImage4, alt: 'Rolex gold collection with tropical leaves' },
  { src: heroImage5, alt: 'Premium watch case collection' },
  { src: heroImage6, alt: 'Sherard W Ng with complete collection' }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] bg-black text-white overflow-hidden">
      {/* Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImages[currentSlide].src}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-sm tracking-widest text-[#D4AF37] mb-4"
          >
            ROLEX • PATEK PHILIPPE • AUDEMARS PIGUET • CARTIER
          </motion.p>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl mb-6 leading-tight font-serif"
          >
            Ultra-Luxury
            <br />
            <span className="text-[#D4AF37]">Timepieces</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg text-neutral-300 mb-8 max-w-xl"
          >
            Curated by Sherard W Ng. Discover the world&apos;s most prestigious 
            watchmakers - Rolex, Patek Philippe, Audemars Piguet, and Cartier. 
            Each piece authenticated and certified.
          </motion.p>
          
          <Link to="/inventory">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg inline-flex items-center space-x-2 hover:bg-[#F4E5B8] transition-all group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 h-2 bg-[#D4AF37]'
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-[#D4AF37]/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}