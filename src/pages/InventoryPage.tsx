import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';

export default function InventoryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="text-sm tracking-widest text-[#D4AF37] uppercase mb-3">Manila Watch Atelier</p>
            <h1 className="text-5xl text-white mb-4 font-serif">Our Collection</h1>
            <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-4" />
            <p className="text-xl text-neutral-400">
              Discover our curated selection of ultra-luxury timepieces
            </p>
          </motion.div>
          <ProductGrid />
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}
