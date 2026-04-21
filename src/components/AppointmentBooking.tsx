import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface AppointmentBookingProps {
  watchName?: string;
  watchId?: string;
  onClose: () => void;
  isOpen: boolean;
}

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM',
];

const inputClass =
  'w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

export function AppointmentBooking({ watchName, watchId, onClose, isOpen }: AppointmentBookingProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 60);
  const maxDate = maxDateObj.toISOString().split('T')[0];

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
          message: `[APPOINTMENT REQUEST]\nDate: ${date}\nTime: ${time}\nWatch: ${watchName || 'General viewing'}\n\nNotes: ${notes || 'None'}`,
          watchId: watchId || null,
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
    setDate('');
    setTime('');
    setNotes('');
    setSubmitted(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={submitted ? 'Appointment requested' : 'Book a viewing'}
      description={watchName}
      size="md"
    >
      {submitted ? (
        <div className="text-center py-4">
          <Calendar className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl text-white mb-2 font-serif">Appointment Requested</h2>
          <p className="text-neutral-400 mb-2">
            We'll confirm your viewing for {date} at {time}.
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Sherard will reach out via WhatsApp or email shortly.
          </p>
          <Button onClick={resetAndClose}>Done</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl text-white">Book a Viewing</h2>
              {watchName && <p className="text-sm text-neutral-400">{watchName}</p>}
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
              <Field label="Phone" name="phone" required>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" className={inputClass} />
              </Field>
            </div>

            <Field label="Email" name="email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Preferred Date" name="date" required>
                <input
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </Field>
              <Field label="Preferred Time" name="time" required>
                <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Additional Notes" name="notes">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requests or questions..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Button type="submit" loading={submitting} leftIcon={<Clock className="w-4 h-4" />} fullWidth>
              Request Appointment
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}
