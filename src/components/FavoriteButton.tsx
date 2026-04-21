import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useWatch } from '../context/WatchContext';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  watchId: string;
  watchName?: string;
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({ watchId, watchName, className = '', showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useWatch();
  const favorite = isFavorite(watchId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favorite) {
      removeFavorite(watchId);
      toast.success('Removed from favorites');
    } else {
      addFavorite(watchId);
      toast.success('Added to favorites');
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={favorite}
      aria-label={favorite ? `Remove ${watchName || 'watch'} from favorites` : `Add ${watchName || 'watch'} to favorites`}
      className={`inline-flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:transition-colors ${className}`}
    >
      <Heart
        className={`w-5 h-5 motion-safe:transition-colors ${favorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 hover:text-red-500'}`}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-sm text-neutral-400">
          {favorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
