import { CartItem } from '../types/inventory';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function Cart({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
}: CartProps) {
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

  const subtotal = items.reduce((sum, item) => sum + (item.price_php || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl"
          >
            Shopping Cart ({items.length})
          </motion.h3>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-neutral-100 transition-colors rounded-full"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <p className="text-neutral-500 mb-4">Your cart is empty</p>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-neutral-900 underline hover:no-underline"
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex space-x-4 pb-6 border-b border-neutral-200"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-neutral-100 flex-shrink-0">
                      <img
                        src={(item as any).image || item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500 mb-1">
                          {item.brand}
                        </p>
                        <h4 className="mb-2">
                          {item.name}
                        </h4>
                        <p className="text-lg">
                          ₱{(item.price_php || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-neutral-300 overflow-hidden">
                          <motion.button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            whileHover={{ backgroundColor: '#f5f5f5' }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="px-4 border-x border-neutral-300"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            whileHover={{ backgroundColor: '#f5f5f5' }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <motion.button
                          onClick={() => onRemoveItem(item.id)}
                          whileHover={{ scale: 1.1, color: '#dc2626' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-neutral-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="border-t border-neutral-200 p-6 space-y-4 bg-neutral-50"
          >
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax</span>
                <span>₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span>₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                alert('Thank you for your interest! Please contact Sherard W Ng on Facebook to complete your purchase.');
                window.open('https://www.facebook.com/sherard.ng', '_blank');
              }}
              className="w-full bg-neutral-900 text-white py-4 px-6 hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 shadow-lg group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Payment Methods Notice */}
            <div className="text-center space-y-1">
              <p className="text-xs text-neutral-600">
                Cash & Bank Transfer Preferred
              </p>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Card payments accepted. Processing fees apply and will be shouldered by customer.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}