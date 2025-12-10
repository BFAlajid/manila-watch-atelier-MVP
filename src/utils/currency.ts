export function formatPrice(pricePhp: number, mode: 'PHP' | 'USD', exchangeRate: number): string {
  if (mode === 'USD') {
    const usd = pricePhp * exchangeRate;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `₱${pricePhp.toLocaleString('en-PH')}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve();
  } catch (err) {
    document.body.removeChild(textArea);
    return Promise.reject(err);
  }
}

export function getWhatsAppLink(watchName: string, price: string, reference?: string): string {
  const message = `Hi! I'm interested in the ${watchName}${reference ? ` (Ref: ${reference})` : ''} - ${price}`;
  const phoneNumber = '639123456789'; // Replace with actual number
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function getShareUrl(slug: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/#/watch/${slug}`;
}

export function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
