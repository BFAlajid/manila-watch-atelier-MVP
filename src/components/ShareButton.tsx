import { Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { copyToClipboard, getShareUrl } from '../utils/currency';

interface ShareButtonProps {
  slug: string;
  watchName: string;
  className?: string;
}

export function ShareButton({ slug, watchName, className = '' }: ShareButtonProps) {
  const handleShare = async () => {
    const url = getShareUrl(slug);
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: watchName,
          text: `Check out this ${watchName} at Manila Watch Atelier`,
          url: url
        });
        return;
      } catch (err) {
        // User cancelled or error - fall through to clipboard
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await copyToClipboard(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to share');
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-[#D4AF37] transition-colors ${className}`}
      title="Share this watch"
    >
      <Share2 className="w-4 h-4" />
    </button>
  );
}
