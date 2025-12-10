import { Shield, Award, RefreshCw, Lock } from 'lucide-react';

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
          <div key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3">
              <Icon className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">{badge.title}</h4>
            <p className="text-xs text-neutral-400">{badge.description}</p>
          </div>
        );
      })}
    </div>
  );
}
