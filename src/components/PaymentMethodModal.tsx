import { X, CreditCard, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCash: () => void;
  onSelectCard: () => void;
  total: number;
}

export function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onSelectCash, 
  onSelectCard,
  total 
}: PaymentMethodModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h3 className="text-xl">Select Payment Method</h3>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-neutral-600 mb-1">Total Amount</p>
              <p className="text-2xl">₱{total.toLocaleString()}</p>
            </div>

            {/* Cash/Bank Transfer Option */}
            <motion.button
              onClick={onSelectCash}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full border-2 border-neutral-300 hover:border-neutral-900 p-6 rounded-lg transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <Banknote className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="mb-1">Cash / Bank Transfer</p>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Preferred method. Contact Sherard directly to complete your purchase.
                  </p>
                  <p className="text-xs text-green-600 mt-2">✓ No additional fees</p>
                </div>
              </div>
            </motion.button>

            {/* Card Payment Option */}
            <motion.button
              onClick={onSelectCard}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full border-2 border-neutral-300 hover:border-neutral-900 p-6 rounded-lg transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="mb-1">Credit / Debit Card</p>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Secure card payment with instant confirmation.
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    *Processing fees apply and will be added to total
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
