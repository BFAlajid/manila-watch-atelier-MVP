import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface WatchRequestFormProps {
  onClose: () => void;
  isOpen: boolean;
}

const BRANDS = ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'Omega', 'Other'];

export function WatchRequestForm({ onClose, isOpen }: WatchRequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [reference, setReference] = useState('');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: `[SOURCING REQUEST]\nBrand: ${brand}\nModel: ${model}\nReference: ${reference || 'Any'}\nBudget: ${budget || 'Flexible'}\n\nDetails: ${details || 'None'}`,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setName(''); setEmail(''); setPhone('');
    setBrand(''); setModel(''); setReference('');
    setBudget(''); setDetails('');
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={resetAndClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-8 relative border border-neutral-800 max-h-[90vh] overflow-y-auto">
              <button
                onClick={resetAndClose}
                aria-label="Close request form"
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                  <h2 className="text-2xl text-white mb-2 font-serif">Request Submitted</h2>
                  <p className="text-neutral-400 mb-2">
                    We'll search our network for your {brand} {model}.
                  </p>
                  <p className="text-neutral-500 text-sm mb-6">
                    Sherard will contact you within 24-48 hours with availability.
                  </p>
                  <button
                    onClick={resetAndClose}
                    className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                      <Search className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white">Request a Watch</h2>
                      <p className="text-sm text-neutral-400">Let us source it for you</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="req-name" className="block text-sm text-neutral-400 mb-1">Name *</label>
                        <input
                          id="req-name"
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="req-phone" className="block text-sm text-neutral-400 mb-1">Phone</label>
                        <input
                          id="req-phone"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="req-email" className="block text-sm text-neutral-400 mb-1">Email *</label>
                      <input
                        id="req-email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div className="border-t border-neutral-800 pt-4">
                      <p className="text-sm text-[#D4AF37] uppercase tracking-widest mb-3">Watch Details</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="req-brand" className="block text-sm text-neutral-400 mb-1">Brand *</label>
                        <select
                          id="req-brand"
                          required
                          value={brand}
                          onChange={e => setBrand(e.target.value)}
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                        >
                          <option value="">Select brand</option>
                          {BRANDS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="req-model" className="block text-sm text-neutral-400 mb-1">Model *</label>
                        <input
                          id="req-model"
                          type="text"
                          required
                          value={model}
                          onChange={e => setModel(e.target.value)}
                          placeholder="e.g. Submariner"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="req-ref" className="block text-sm text-neutral-400 mb-1">Reference Number</label>
                        <input
                          id="req-ref"
                          type="text"
                          value={reference}
                          onChange={e => setReference(e.target.value)}
                          placeholder="e.g. 126610LN"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="req-budget" className="block text-sm text-neutral-400 mb-1">Budget Range</label>
                        <select
                          id="req-budget"
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                        >
                          <option value="">Flexible</option>
                          <option value="Under ₱500K">Under ₱500K</option>
                          <option value="₱500K - ₱1M">₱500K - ₱1M</option>
                          <option value="₱1M - ₱3M">₱1M - ₱3M</option>
                          <option value="₱3M - ₱5M">₱3M - ₱5M</option>
                          <option value="Over ₱5M">Over ₱5M</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="req-details" className="block text-sm text-neutral-400 mb-1">Additional Details</label>
                      <textarea
                        id="req-details"
                        rows={3}
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        placeholder="Condition preference, year, dial color, etc."
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
