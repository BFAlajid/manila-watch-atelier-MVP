import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Button } from './ui/Button';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchName: string;
  watchReference: string;
  watchPrice: string;
  watchId?: string;
}

const inputClass =
  'w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

export function InquiryModal({ isOpen, onClose, watchName, watchReference, watchPrice, watchId }: InquiryModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formData.message || `Interested in ${watchName} (Ref: ${watchReference}) at ${watchPrice}`,
          watchId: watchId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send inquiry');
      }

      toast.success('Inquiry sent! Sherard will contact you within 24 hours.');
      onClose();
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inquire about this watch"
      description={`${watchName} — ${watchPrice}`}
      size="md"
    >
      <h2 className="text-2xl text-white mb-2">Inquire About This Watch</h2>
      <p className="text-neutral-400 mb-6">
        {watchName} <span className="text-[#D4AF37]">{watchPrice}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" name="name" required>
          <input type="text" value={formData.name} onChange={handleChange} placeholder="Your full name" className={inputClass} />
        </Field>

        <Field label="Email" name="email" required>
          <input type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
        </Field>

        <Field label="Phone" name="phone">
          <input type="tel" value={formData.phone} onChange={handleChange} placeholder="+63 xxx xxx xxxx" className={inputClass} />
        </Field>

        <Field label="Message" name="message">
          <textarea
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Any questions or special requests..."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Button type="submit" loading={isSubmitting} leftIcon={<Send className="w-4 h-4" />} fullWidth>
          {isSubmitting ? 'Sending…' : 'Send Inquiry'}
        </Button>
      </form>

      <p className="text-xs text-neutral-500 mt-4 text-center">We typically respond within 24 hours</p>
    </Modal>
  );
}
