import { useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface WatchRequestFormProps {
  onClose: () => void;
  isOpen: boolean;
}

const BRANDS = ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'Omega', 'Tudor', 'Other'];

const inputClass =
  'w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: `[SOURCING REQUEST]\nBrand: ${brand}\nModel: ${model}\nReference: ${reference || 'Any'}\nBudget: ${budget || 'Flexible'}\n\nDetails: ${details || 'None'}`,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${response.status})`);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message === 'Failed to fetch'
          ? 'Could not reach the server. Please check your connection and try again, or message Sherard on WhatsApp.'
          : err?.message || 'Something went wrong. Please try again or message Sherard on WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBrand('');
    setModel('');
    setReference('');
    setBudget('');
    setDetails('');
    setSubmitted(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={submitted ? 'Request submitted' : 'Request a watch'}
      description="Let us source it for you"
      size="md"
    >
      {submitted ? (
        <div className="text-center py-4">
          <Search className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl text-white mb-2 font-serif">Request Submitted</h2>
          <p className="text-neutral-400 mb-2">
            We'll search our network for your {brand} {model}.
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Sherard will contact you within 24-48 hours with availability.
          </p>
          <Button onClick={resetAndClose}>Done</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl text-white">Request a Watch</h2>
              <p className="text-sm text-neutral-400">Let us source it for you</p>
            </div>
          </div>

          {errorMessage && (
            <Alert tone="error" className="mb-4">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" name="name" required>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone" name="phone">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </Field>
            </div>

            <Field label="Email" name="email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>

            <div className="border-t border-neutral-800 pt-4">
              <p className="text-sm text-[#D4AF37] uppercase tracking-widest mb-3">Watch Details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand" name="brand" required>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass}>
                  <option value="">Select brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Model" name="model" required>
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Submariner" className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Reference Number" name="reference">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 126610LN"
                  className={inputClass}
                />
              </Field>
              <Field label="Budget Range" name="budget">
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass}>
                  <option value="">Flexible</option>
                  <option value="Under ₱500K">Under ₱500K</option>
                  <option value="₱500K - ₱1M">₱500K - ₱1M</option>
                  <option value="₱1M - ₱3M">₱1M - ₱3M</option>
                  <option value="₱3M - ₱5M">₱3M - ₱5M</option>
                  <option value="Over ₱5M">Over ₱5M</option>
                </select>
              </Field>
            </div>

            <Field label="Additional Details" name="details">
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Condition preference, year, dial color, etc."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Button type="submit" loading={submitting} leftIcon={<Search className="w-4 h-4" />} fullWidth>
              Submit Request
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}
