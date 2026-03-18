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
    <motion.button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 ${className}`}
      whileTap={{ scale: 0.9 }}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <motion.div
        animate={{ scale: favorite ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 hover:text-red-500'} transition-colors`}
        />
      </motion.div>
      {showLabel && (
        <span className="text-sm text-neutral-600">
          {favorite ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  );
}
