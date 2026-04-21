import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Modal } from './ui/Modal';
import { IconButton } from './ui/IconButton';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose, alt = 'Watch image' }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % images.length);
  }, [images.length]);

  // Modal handles Escape + scroll-lock + focus-trap. We pipe arrow keys through
  // its onKeyDown to drive gallery navigation.
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [prev, next]
  );

  if (!images.length) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${alt} image viewer`}
      size="xl"
      unstyled
      hideCloseButton
      onKeyDown={handleKey}
    >
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <IconButton
            label="Close image viewer"
            icon={<X className="w-6 h-6" />}
            variant="filled"
            size="lg"
            onClick={onClose}
            className="absolute top-4 right-4"
          />

          {images.length > 1 && (
            <div
              aria-live="polite"
              className="absolute top-4 left-4 px-3 py-1.5 bg-white/10 rounded-full text-white text-sm"
            >
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {images.length > 1 && (
            <IconButton
              label="Previous image"
              icon={<ChevronLeft className="w-6 h-6" />}
              variant="filled"
              size="lg"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            />
          )}

          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg motion-reduce:transition-none"
          />

          {images.length > 1 && (
            <IconButton
              label="Next image"
              icon={<ChevronRight className="w-6 h-6" />}
              variant="filled"
              size="lg"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            />
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] snap-x">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View image ${idx + 1} of ${images.length}`}
                  aria-current={idx === currentIndex ? 'true' : undefined}
                  className={`shrink-0 snap-start w-14 h-14 rounded-lg overflow-hidden border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:transition-colors ${
                    idx === currentIndex ? 'border-[#D4AF37]' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <img src={img} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Small trigger button shown over the primary image to indicate zoom is available.
export function ZoomTrigger({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      label="Zoom image"
      icon={<ZoomIn className="w-5 h-5" />}
      variant="filled"
      size="sm"
      onClick={onClick}
      className="absolute bottom-4 right-4 z-10"
      title="Click to zoom"
    />
  );
}
