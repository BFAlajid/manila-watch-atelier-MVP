import { Watch } from '../types/inventory';
import { ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ScarcityIndicator } from './psychology/ScarcityIndicator';
import { SocialProofBadge } from './psychology/SocialProofBadge';
import { FOMOIndicator } from './psychology/FOMOIndicator';

interface ProductCardProps {
  watch: Watch & { image?: string };
  onSelect: () => void;
  onAddToCart: () => void;
}

export function ProductCard({ watch, onSelect, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden bg-neutral-100">
        <motion.img
          src={watch.image}
          alt={watch.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Overlay Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-3"
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-neutral-900 p-3 hover:bg-neutral-100 transition-colors shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-neutral-900 p-3 hover:bg-neutral-100 transition-colors shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Category Badge */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-3 left-3 bg-white px-3 py-1 text-xs tracking-wide shadow-md"
        >
          {watch.category}
        </motion.div>

        {/* FOMO Indicator - Top Right */}
        <div className="absolute top-3 right-3">
          <FOMOIndicator
            watchId={watch.id}
            tier={watch.availability || 'A'}
            condition={watch.condition}
            brand={watch.brand}
          />
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.8 }}
          style={{ transform: 'skewX(-20deg)' }}
        />
      </div>

      {/* Product Info */}
      <motion.div
        className="space-y-2"
        animate={{ y: isHovered ? -5 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Social Proof Badges */}
        <SocialProofBadge
          watchId={watch.id}
          tier={watch.availability || 'A'}
          brand={watch.brand}
          condition={watch.condition}
        />

        <p className="text-sm text-neutral-500 tracking-wide uppercase">
          {watch.brand}
        </p>
        <h4 className="text-lg group-hover:text-neutral-600 transition-colors">
          {watch.name}
        </h4>
        <motion.p
          className="text-lg"
          animate={{
            scale: isHovered ? 1.05 : 1,
            color: isHovered ? '#000' : '#171717'
          }}
          transition={{ duration: 0.3 }}
        >
          ₱{(watch.price_php || 0).toLocaleString()}
        </motion.p>

        {/* Scarcity Indicator - Only for Tier A */}
        {(watch.availability === 'A' || !watch.availability) && (
          <ScarcityIndicator
            tier="A"
            watchId={watch.id}
            availability={watch.availability}
          />
        )}
      </motion.div>
    </motion.div>
  );
}