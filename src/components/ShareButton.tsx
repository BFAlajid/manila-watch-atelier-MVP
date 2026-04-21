import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, getShareUrl } from '../utils/currency';
import { IconButton } from './ui/IconButton';

interface ShareButtonProps {
  slug: string;
  watchName: string;
  className?: string;
}

export function ShareButton({ slug, watchName, className = '' }: ShareButtonProps) {
  const handleShare = async () => {
    const url = getShareUrl(slug);

    if (navigator.share) {
      try {
        await navigator.share({
          title: watchName,
          text: `Check out this ${watchName} at Manila Watch Atelier`,
          url,
        });
        return;
      } catch {
        // User cancelled or error — fall through to clipboard
      }
    }

    try {
      await copyToClipboard(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to share');
    }
  };

  return (
    <IconButton
      label={`Share ${watchName}`}
      icon={<Share2 className="w-4 h-4" />}
      variant="subtle"
      size="sm"
      onClick={handleShare}
      title="Share this watch"
      className={className}
    />
  );
}
