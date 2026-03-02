interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Image component with responsive sizing hints and lazy loading.
 * Uses the `sizes` attribute to help browsers pick the right resolution
 * and `decoding="async"` to avoid blocking the main thread.
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy',
  onError,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      sizes={sizes}
      onError={onError}
    />
  );
}
