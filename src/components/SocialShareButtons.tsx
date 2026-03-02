import { Facebook, Twitter, Link2, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { copyToClipboard, getShareUrl } from '../utils/currency';

interface SocialShareButtonsProps {
  slug: string;
  watchName: string;
  brand: string;
  price: string;
  className?: string;
}

export function SocialShareButtons({ slug, watchName, brand, price, className = '' }: SocialShareButtonsProps) {
  const url = getShareUrl(slug);
  const text = `Check out this ${brand} ${watchName} at ${price} — Manila Watch Atelier`;

  const share = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(`${brand} ${watchName} — Manila Watch Atelier`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = async () => {
    try {
      await copyToClipboard(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-neutral-500 mr-1">Share:</span>
      <button
        onClick={() => share('facebook')}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-[#1877F2]/20 text-neutral-400 hover:text-[#1877F2] transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      <button
        onClick={() => share('twitter')}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-[#1DA1F2]/20 text-neutral-400 hover:text-[#1DA1F2] transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={() => share('email')}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-[#D4AF37]/20 text-neutral-400 hover:text-[#D4AF37] transition-colors"
        aria-label="Share via Email"
      >
        <Mail className="w-4 h-4" />
      </button>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-[#D4AF37]/20 text-neutral-400 hover:text-[#D4AF37] transition-colors"
        aria-label="Copy link"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}
