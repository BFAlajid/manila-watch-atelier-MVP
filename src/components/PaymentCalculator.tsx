import { Calculator } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentCalculatorProps {
  price: number;
}

export function PaymentCalculator({ price }: PaymentCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [months, setMonths] = useState(12);

  const interestRate = 0.15; // 15% annual interest (adjust as needed)
  const monthlyInterest = interestRate / 12;
  const monthlyPayment = (price * monthlyInterest * Math.pow(1 + monthlyInterest, months)) / 
                         (Math.pow(1 + monthlyInterest, months) - 1);

  const plans = [3, 6, 12, 24, 36];

  return (
    <div className="border border-neutral-800 rounded-xl p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full"
      >
        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-white">Payment Calculator</h3>
          <p className="text-sm text-neutral-400">Estimate monthly installments</p>
        </div>
        <span className="text-neutral-400">{isOpen ? '−' : '+'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-6 border-t border-neutral-800">
              <div className="space-y-4">
                {/* Month Selector */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-3">
                    Payment Period: {months} months
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {plans.map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setMonths(plan)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          months === plan
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        {plan}mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Price</span>
                    <span className="text-white">₱{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Monthly Payment</span>
                    <span className="text-[#D4AF37]">₱{Math.round(monthlyPayment).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Total Interest ({(interestRate * 100).toFixed(0)}% APR)</span>
                    <span className="text-neutral-500">
                      ₱{Math.round((monthlyPayment * months) - price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-neutral-700">
                    <span className="text-white">Total to Pay</span>
                    <span className="text-white">₱{Math.round(monthlyPayment * months).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-500">
                  * This is an estimate. Actual terms may vary based on approval and bank policies.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
