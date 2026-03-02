import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    // Store subscriber locally (Resend integration can be added later)
    try {
      const existing = JSON.parse(localStorage.getItem('manila-newsletter-subscribers') || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('manila-newsletter-subscribers', JSON.stringify(existing));
      }
    } catch {
      // Ignore localStorage errors
    }

    // Simulate brief delay for UX
    await new Promise(r => setTimeout(r, 500));
    setSubscribed(true);
    setLoading(false);
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-[#D4AF37]"
      >
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm">You're on the list!</span>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-[#D4AF37]" />
        <h4 className="text-sm tracking-widest uppercase text-[#D4AF37]">New Arrivals</h4>
      </div>
      <p className="text-neutral-400 text-sm mb-3">
        Be the first to know when new timepieces arrive.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email for newsletter"
          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:border-[#D4AF37] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#D4AF37] text-black text-sm rounded-lg hover:bg-[#F4E5B8] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '...' : 'Notify Me'}
        </button>
      </form>
    </div>
  );
}
