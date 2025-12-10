import { motion } from 'motion/react';
import { Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UrgencyTimerProps {
  tier: string;
  estimatedArrival?: string;
  watchId: string;
  pricePhp: number;
}

export function UrgencyTimer({ tier, estimatedArrival, watchId, pricePhp }: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [urgencyType, setUrgencyType] = useState<'arrival' | 'price-increase' | 'availability' | null>(null);

  useEffect(() => {
    // Generate consistent seed from watchId
    const seed = watchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed % 100) / 100;

    // Tier B: Countdown to arrival
    if (tier === 'B' && estimatedArrival) {
      setUrgencyType('arrival');
      const arrivalDate = new Date(estimatedArrival);

      const updateCountdown = () => {
        const now = new Date();
        const diff = arrivalDate.getTime() - now.getTime();

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }

    // Tier A: Price increase countdown (30% chance for high-value watches)
    if (tier === 'A' && pricePhp > 500000 && random > 0.7) {
      setUrgencyType('price-increase');

      // Create a countdown to "price increase" in 24-72 hours
      const hoursUntilIncrease = 24 + (seed % 48); // 24-72 hours
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + hoursUntilIncrease);

      const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }

    // Tier C: Availability window (20% chance)
    if (tier === 'C' && random > 0.8) {
      setUrgencyType('availability');

      // Create a countdown for "sourcing window" (48 hours)
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + 48);

      const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [tier, estimatedArrival, watchId, pricePhp]);

  if (!timeLeft || !urgencyType) return null;

  const getUrgencyConfig = () => {
    switch (urgencyType) {
      case 'arrival':
        return {
          icon: <Clock className="w-4 h-4" />,
          title: 'Arriving in:',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        };
      case 'price-increase':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          title: 'Price increase in:',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20'
        };
      case 'availability':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          title: 'Sourcing window ends in:',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        };
    }
  };

  const config = getUrgencyConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={config.color}>{config.icon}</span>
        <span className={`text-xs font-medium ${config.color}`}>{config.title}</span>
      </div>

      <div className="flex gap-2">
        {/* Hours */}
        <div className="flex-1 bg-neutral-900/50 rounded-lg p-2 text-center">
          <motion.div
            key={timeLeft.hours}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${config.color}`}
          >
            {String(timeLeft.hours).padStart(2, '0')}
          </motion.div>
          <div className="text-xs text-neutral-500 mt-1">Hours</div>
        </div>

        {/* Minutes */}
        <div className="flex-1 bg-neutral-900/50 rounded-lg p-2 text-center">
          <motion.div
            key={timeLeft.minutes}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${config.color}`}
          >
            {String(timeLeft.minutes).padStart(2, '0')}
          </motion.div>
          <div className="text-xs text-neutral-500 mt-1">Minutes</div>
        </div>

        {/* Seconds */}
        <div className="flex-1 bg-neutral-900/50 rounded-lg p-2 text-center">
          <motion.div
            key={timeLeft.seconds}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${config.color}`}
          >
            {String(timeLeft.seconds).padStart(2, '0')}
          </motion.div>
          <div className="text-xs text-neutral-500 mt-1">Seconds</div>
        </div>
      </div>

      {/* Additional context message */}
      {urgencyType === 'price-increase' && (
        <p className="text-xs text-neutral-400 mt-2 text-center">
          Lock in current price before it increases
        </p>
      )}
      {urgencyType === 'availability' && (
        <p className="text-xs text-neutral-400 mt-2 text-center">
          Submit inquiry to secure sourcing opportunity
        </p>
      )}
    </motion.div>
  );
}
