/**
 * Contact Information Configuration
 * Update these values with actual contact details
 */

export const CONTACT_INFO = {
  // WhatsApp
  whatsapp: {
    number: '639123456789', // Format: country code + number (no + or spaces)
    displayNumber: '+63 912 345 6789', // Display format
  },

  // Email
  email: {
    primary: 'sherard@manilawatch.com',
    inquiries: 'inquiries@manilawatch.com', // Or use primary
  },

  // Social Media
  social: {
    instagram: 'https://www.instagram.com/manilawatchatelier/',
    facebook: 'https://www.facebook.com/sherard.ng',
    messenger: 'https://m.me/sherard.ng',
  },

  // Business Info
  business: {
    name: 'Manila Watch Atelier',
    dealerName: 'Sherard W Ng',
    location: 'Manila, Philippines',
  },
};

/**
 * Generate WhatsApp link with pre-filled message
 */
export function getWhatsAppLink(watchName: string, price: string, reference?: string): string {
  const message = `Hi! I'm interested in the ${watchName}${reference ? ` (Ref: ${reference})` : ''} - ${price}`;
  return `https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate email mailto link
 */
export function getEmailLink(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);

  const queryString = params.toString();
  return `mailto:${CONTACT_INFO.email.inquiries}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Generate inquiry email for a specific watch
 */
export function getWatchInquiryEmail(watchName: string, price: string, reference?: string): string {
  const subject = `Inquiry: ${watchName}${reference ? ` (Ref: ${reference})` : ''}`;
  const body = `Hello,

I am interested in the ${watchName}${reference ? ` (Reference: ${reference})` : ''}.
Price: ${price}

Please provide more information about:
- Current availability
- Condition and authenticity documentation
- Payment options
- Shipping details

Thank you!`;

  return getEmailLink(subject, body);
}
