import { Shield, Award, RefreshCw, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: '100% Authentic',
      description: 'Guaranteed genuine timepieces'
    },
    {
      icon: Award,
      title: '3-Month Warranty',
      description: 'Complimentary service coverage'
    },
    {
      icon: RefreshCw,
      title: 'Buy-Back Guarantee',
      description: 'Trade-in or sell back anytime'
    },
    {
      icon: Lock,
      title: 'Secure Transactions',
      description: 'Bank transfer & card payments'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-t border-neutral-800">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3"
            >
              <Icon className="w-6 h-6 text-[#D4AF37]" />
            </motion.div>
            <h4 className="text-sm font-medium text-white mb-1">{badge.title}</h4>
            <p className="text-xs text-neutral-400">{badge.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
