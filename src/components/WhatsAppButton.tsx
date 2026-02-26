import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getWhatsAppLink } from '../utils/currency';

interface WhatsAppButtonProps {
  watchName?: string;
  price?: string;
  reference?: string;
  position?: 'fixed' | 'inline';
}

export function WhatsAppButton({ watchName, price, reference, position = 'fixed' }: WhatsAppButtonProps) {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '639171234567';
  const link = watchName && price
    ? getWhatsAppLink(watchName, price, reference)
    : `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Sherard! I\'m browsing Manila Watch Atelier and would like to inquire about your collection.')}`;

  const buttonClass = position === 'fixed'
    ? 'fixed bottom-6 right-6 z-40'
    : '';

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${buttonClass} bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-colors`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <MessageCircle className="w-6 h-6" />
      {position === 'inline' && <span>Inquire via WhatsApp</span>}
    </motion.a>
  );
}
