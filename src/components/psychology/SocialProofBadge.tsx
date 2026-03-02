import { motion } from 'motion/react';
import { Star, TrendingUp, CheckCircle, Award, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SocialProofBadgeProps {
  watchId: string;
  tier: string;
  brand: string;
  condition?: string;
}

type BadgeType = 'trending' | 'top-seller' | 'recently-sold' | 'verified' | 'new-arrival';

interface Badge {
  type: BadgeType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function SocialProofBadge({ watchId, tier, brand, condition }: SocialProofBadgeProps) {
  const [activeBadges, setActiveBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const badges: Badge[] = [];

    // Generate consistent random seed from watchId
    const seed = watchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed % 100) / 100;

    // Top Seller Badge (20% chance)
    if (random > 0.8) {
      badges.push({
        type: 'top-seller',
        label: 'Top Seller',
        icon: <Award className="w-3 h-3" />,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10'
      });
    }

    // Trending Badge (25% chance for popular brands)
    if (['Rolex', 'Patek Philippe', 'Audemars Piguet'].includes(brand) && random > 0.5 && random <= 0.75) {
      badges.push({
        type: 'trending',
        label: 'Trending',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      });
    }

    // Recently Sold Badge (15% chance for Tier B/C)
    if ((tier === 'B' || tier === 'C') && random > 0.3 && random <= 0.45) {
      badges.push({
        type: 'recently-sold',
        label: 'Recently Sold',
        icon: <CheckCircle className="w-3 h-3" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      });
    }

    // Verified Authentic Badge (always show for luxury brands)
    if (['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Cartier'].includes(brand)) {
      badges.push({
        type: 'verified',
        label: 'Verified Authentic',
        icon: <Star className="w-3 h-3" />,
        color: 'text-[#D4AF37]',
        bgColor: 'bg-[#D4AF37]/10'
      });
    }

    // New Arrival Badge (for unworn/brand new condition)
    if (condition === 'Brand New' || condition === 'Unworn') {
      badges.push({
        type: 'new-arrival',
        label: 'New Arrival',
        icon: <Clock className="w-3 h-3" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10'
      });
    }

    setActiveBadges(badges);
  }, [watchId, tier, brand, condition]);

  if (activeBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeBadges.map((badge, index) => (
        <motion.div
          key={badge.type}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${badge.bgColor.replace('/10', '/20')} border ${badge.bgColor.replace('bg-', 'border-').replace('/10', '/30')} ${badge.color} text-xs font-medium`}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Testimonial Snippet Component for Detail Pages
interface TestimonialSnippetProps {
  brand: string;
}

export function TestimonialSnippet({ brand }: TestimonialSnippetProps) {
  const testimonials = {
    'Rolex': [
      { text: "Excellent service, watch exactly as described!", author: "Michael T.", rating: 5 },
      { text: "Fast shipping, authentic piece. Highly recommend!", author: "Sarah L.", rating: 5 },
      { text: "My third purchase from Manila Watch. Always genuine!", author: "James K.", rating: 5 }
    ],
    'Patek Philippe': [
      { text: "Dream watch acquired! Sherard was very professional.", author: "Robert C.", rating: 5 },
      { text: "Worth every peso. Stunning timepiece!", author: "David M.", rating: 5 }
    ],
    'Audemars Piguet': [
      { text: "Incredible Royal Oak, perfect condition!", author: "Mark S.", rating: 5 },
      { text: "Authentic and beautiful. Very satisfied!", author: "Thomas W.", rating: 5 }
    ],
    'default': [
      { text: "Great experience, highly recommend!", author: "Customer", rating: 5 },
      { text: "Authentic watches, professional service.", author: "Verified Buyer", rating: 5 }
    ]
  };

  const brandTestimonials = testimonials[brand] || testimonials['default'];
  const [currentTestimonial, setCurrentTestimonial] = useState(brandTestimonials[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => {
        const currentIndex = brandTestimonials.indexOf(prev);
        const nextIndex = (currentIndex + 1) % brandTestimonials.length;
        return brandTestimonials[nextIndex];
      });
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [brand]);

  return (
    <motion.div
      key={currentTestimonial.text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700"
    >
      <div className="flex gap-1 mb-2">
        {[...Array(currentTestimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-neutral-300 mb-2">"{currentTestimonial.text}"</p>
      <p className="text-xs text-neutral-500">— {currentTestimonial.author}</p>
    </motion.div>
  );
}
