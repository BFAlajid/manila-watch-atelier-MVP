import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { DealerSection } from '../components/DealerSection';
import { Footer } from '../components/Footer';
import { TrustBadges } from '../components/TrustBadges';
import { RecentActivityFeed } from '../components/psychology/FOMOIndicator';
import { motion } from 'motion/react';

export default function HomePage() {
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
          </div>

          {/* Sidebar with Recent Activity */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RecentActivityFeed />
            </div>
          </div>
        </div>
      </div>
      <DealerSection />
      <Footer />
    </motion.div>
  );
}
