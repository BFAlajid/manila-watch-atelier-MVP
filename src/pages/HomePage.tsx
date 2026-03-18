import { useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { DealerSection } from '../components/DealerSection';
import { Footer } from '../components/Footer';
import { TrustBadges } from '../components/TrustBadges';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { WatchRequestForm } from '../components/WatchRequestForm';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <Header />
      <Hero />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProductGrid limit={6} />
            <TrustBadges />

            {/* Recently Viewed */}
            <RecentlyViewed />
          </div>

          {/* Sidebar with Recent Activity */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Watch Request CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
              >
                <Search className="w-8 h-8 text-[#D4AF37] mb-3" />
                <h4 className="text-white text-lg mb-2">Can't Find Your Watch?</h4>
                <p className="text-neutral-400 text-sm mb-4">
                  Let us source it from our trusted network of dealers worldwide.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(true)}
                  className="w-full py-2 bg-[#D4AF37] text-black text-sm rounded-lg hover:bg-[#F4E5B8] transition-colors"
                >
                  Request a Watch
                </button>
              </motion.div>

              {/* Sold Archive Link */}
              <Link
                to="/sold"
                className="block bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-[#D4AF37]/30 transition-colors group"
              >
                <p className="text-sm text-[#D4AF37] uppercase tracking-widest mb-1">Archive</p>
                <p className="text-white group-hover:text-[#D4AF37] transition-colors">
                  Previously Sold Pieces &rarr;
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <DealerSection />
      <Footer />

      <WatchRequestForm isOpen={showRequestForm} onClose={() => setShowRequestForm(false)} />
    </motion.div>
  );
}
