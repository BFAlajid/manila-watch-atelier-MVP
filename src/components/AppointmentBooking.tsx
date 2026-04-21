import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, X, CheckCircle } from 'lucide-react';

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

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Max date is 60 days out
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
                aria-label="Close appointment form"
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
                  <h2 className="text-2xl text-white mb-2 font-serif">Appointment Requested</h2>
                  <p className="text-neutral-400 mb-2">
                    We'll confirm your viewing for {date} at {time}.
                  </p>
                  <p className="text-neutral-500 text-sm mb-6">
                    Sherard will reach out via WhatsApp or email shortly.
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
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white">Book a Viewing</h2>
                      {watchName && (
                        <p className="text-sm text-neutral-400">{watchName}</p>
                      )}
                    </div>
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="appt-name" className="block text-sm text-neutral-400 mb-1">Name *</label>
                        <input
                          id="appt-name"
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="appt-phone" className="block text-sm text-neutral-400 mb-1">Phone *</label>
                        <input
                          id="appt-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="appt-email" className="block text-sm text-neutral-400 mb-1">Email *</label>
                      <input
                        id="appt-email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="appt-date" className="block text-sm text-neutral-400 mb-1">Preferred Date *</label>
                        <input
                          id="appt-date"
                          type="date"
                          required
                          min={minDate}
                          max={maxDate}
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-400 mb-1">Preferred Time *</label>
                        <select
                          required
                          value={time}
                          onChange={e => setTime(e.target.value)}
                          aria-label="Select preferred time"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                        >
                          <option value="">Select time</option>
                          {TIME_SLOTS.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="appt-notes" className="block text-sm text-neutral-400 mb-1">Additional Notes</label>
                      <textarea
                        id="appt-notes"
                        rows={3}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any specific requests or questions..."
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
                          <Clock className="w-4 h-4" />
                          Request Appointment
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
