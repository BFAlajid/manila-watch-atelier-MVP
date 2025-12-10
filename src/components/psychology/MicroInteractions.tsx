import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

// Confetti Animation for Favorites/Comparison Add
interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);

  useEffect(() => {
    if (trigger) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        color: ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360
      }));

      setParticles(newParticles);

      // Clear after animation
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);
    }
  }, [trigger, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: [0, 1.5, 0.5],
              rotate: particle.rotation,
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Success Toast Notification
interface ToastProps {
  message: string;
  icon?: React.ReactNode;
  show: boolean;
  onClose?: () => void;
  duration?: number;
}

export function SuccessToast({ message, icon, show, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          {icon || <CheckCircle className="w-5 h-5" />}
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Favorite Button with Animation
interface FavoriteButtonAnimatedProps {
  isFavorite: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButtonAnimated({ isFavorite, onClick, size = 'md' }: FavoriteButtonAnimatedProps) {
  const [showSparkles, setShowSparkles] = useState(false);

  const handleClick = () => {
    if (!isFavorite) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 600);
    }
    onClick();
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 flex items-center justify-center relative overflow-hidden group`}
      >
        <motion.div
          animate={isFavorite ? {
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{ duration: 0.4 }}
        >
          <Heart
            className={`${iconSizes[size]} ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 group-hover:text-red-500'} transition-colors`}
          />
        </motion.div>

        {/* Background pulse on favorite */}
        {isFavorite && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Sparkles */}
      <AnimatePresence>
        {showSparkles && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 30,
                  y: Math.sin((i * Math.PI * 2) / 8) * 30,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Rating Stars with Animation
interface AnimatedRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function AnimatedRating({ rating, maxRating = 5, size = 'md', animated = true }: AnimatedRatingProps) {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex gap-1">
      {[...Array(maxRating)].map((_, index) => (
        <motion.div
          key={index}
          initial={animated ? { scale: 0, rotate: -180 } : {}}
          animate={animated ? { scale: 1, rotate: 0 } : {}}
          transition={animated ? { delay: index * 0.1, type: 'spring', stiffness: 200 } : {}}
        >
          <Star
            className={`${iconSizes[size]} ${
              index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-600'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Shimmer Loading Effect
export function ShimmerLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-neutral-800 rounded ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

// Hover Reveal Effect
interface HoverRevealProps {
  children: React.ReactNode;
  revealContent: React.ReactNode;
}

export function HoverReveal({ children, revealContent }: HoverRevealProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-neutral-900/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
          >
            {revealContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Number Counter Animation
interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, duration = 1, prefix = '', suffix = '' }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      setDisplayValue(Math.floor(startValue + difference * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Pulse Dot Indicator
export function PulseDot({ color = 'bg-green-500' }: { color?: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={`w-2 h-2 ${color} rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className={`absolute w-2 h-2 ${color} rounded-full`}
        animate={{
          scale: [1, 2, 2.5],
          opacity: [0.7, 0.3, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
    </div>
  );
}
