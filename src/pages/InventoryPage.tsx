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
          <div className="mb-12">
            <h1 className="text-5xl text-white mb-4">Our Collection</h1>
            <p className="text-xl text-neutral-400">
              Discover our curated selection of ultra-luxury timepieces
            </p>
          </div>
          <ProductGrid />
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}
