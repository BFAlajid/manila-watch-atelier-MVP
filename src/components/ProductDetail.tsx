import { Watch } from '../types/inventory';
import { X, ShoppingCart, Check, Shield, Award, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailProps {
  watch: Watch & { image?: string };
  onClose: () => void;
  onAddToCart: (watch: Watch) => void;
}

export function ProductDetail({ watch, onClose, onAddToCart }: ProductDetailProps) {
  const [added, setAdded] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCart = () => {
    onAddToCart(watch);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white max-w-5xl w-full my-8 relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white transition-colors shadow-lg"
          >
            <X className="w-6 h-6" />
          </motion.button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <motion.div
              className="aspect-square bg-neutral-100 relative overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
            >
              <motion.img
                src={watch.image}
                alt={watch.name}
                className="w-full h-full object-cover"
                animate={{ scale: imageZoom ? 1.3 : 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Floating badges */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-4 left-4 bg-neutral-900 text-white px-3 py-2 text-xs flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Authenticated</span>
              </motion.div>
            </motion.div>

            {/* Details */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="flex-1">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm tracking-widest text-neutral-500 mb-2 uppercase"
                >
                  {watch.brand}
                </motion.p>
                
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl mb-4"
                >
                  {watch.name}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-2xl mb-6"
                >
                  ₱{(watch.price_php || 0).toLocaleString()}
                </motion.p>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-4 mb-6 pb-6 border-b border-neutral-200"
                >
                  <div className="flex items-center space-x-1 text-sm text-neutral-600">
                    <Award className="w-4 h-4" />
                    <span>Certified</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-neutral-600">
                    <Shield className="w-4 h-4" />
                    <span>Authentic</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-neutral-600">
                    <Clock className="w-4 h-4" />
                    <span>Warranty</span>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-neutral-600 mb-8 leading-relaxed"
                >
                  {watch.description}
                </motion.p>

                {/* Specifications */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-8"
                >
                  <h4 className="text-sm tracking-widest mb-4 uppercase">
                    Specifications
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(watch.specifications).map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex justify-between py-2 border-b border-neutral-200 group hover:border-neutral-400 transition-colors"
                      >
                        <span className="text-neutral-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">
                          {value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="space-y-3"
              >
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-neutral-900 text-white py-4 px-6 hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>Added to Cart</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.open('https://www.facebook.com/sherard.ng', '_blank');
                  }}
                  className="w-full border border-neutral-300 py-4 px-6 hover:bg-neutral-50 transition-colors"
                >
                  Contact for Availability
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}