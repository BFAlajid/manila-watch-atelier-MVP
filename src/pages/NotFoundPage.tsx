import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <p className="text-8xl font-bold text-[#D4AF37] mb-4">404</p>
          <h1 className="text-3xl mb-3 font-serif">
            Page Not Found
          </h1>
          <p className="text-neutral-400 mb-8">
            The timepiece you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors"
            >
              <Home className="w-4 h-4" />
              Homepage
            </Link>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 text-white rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Inventory
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
