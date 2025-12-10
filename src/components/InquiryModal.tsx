import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchName: string;
  watchReference: string;
  watchPrice: string;
}

export function InquiryModal({ isOpen, onClose, watchName, watchReference, watchPrice }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending email (replace with actual email service like EmailJS or Formspree)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store inquiry in localStorage for admin to review
    const inquiries = JSON.parse(localStorage.getItem('manila-watch-inquiries') || '[]');
    inquiries.push({
      ...formData,
      watchName,
      watchReference,
      watchPrice,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('manila-watch-inquiries', JSON.stringify(inquiries));

    toast.success('Inquiry sent! We\'ll contact you within 24 hours.');
    setIsSubmitting(false);
    onClose();
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-8 relative border border-neutral-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl text-white mb-2">Inquire About This Watch</h2>
              <p className="text-neutral-400 mb-6">
                {watchName} <span className="text-[#D4AF37]">{watchPrice}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                    placeholder="+63 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none resize-none"
                    placeholder="Any questions or special requests..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>

              <p className="text-xs text-neutral-500 mt-4 text-center">
                We typically respond within 24 hours
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
