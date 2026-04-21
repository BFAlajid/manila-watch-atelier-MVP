import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useScrollLock } from './useScrollLock';
import { IconButton } from './IconButton';

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  unstyled?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
}

const sizeToMaxWidth: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  initialFocusRef,
  children,
  hideCloseButton = false,
  unstyled = false,
  onKeyDown,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const shouldReduceMotion = useReducedMotion();

  useScrollLock(isOpen);

  // Save + restore focus, move focus into the dialog.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) || null;

    // Defer focus by one tick so the portal has mounted children.
    const id = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ||
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ||
        panelRef.current;
      target?.focus();
    }, 0);

    return () => {
      window.clearTimeout(id);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, initialFocusRef]);

  // Key handlers: ESC + focus trap.
  useEffect(() => {
    if (!isOpen) return;

    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
      onKeyDown?.(e);
    };

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, closeOnEscape, onClose, onKeyDown]);

  if (typeof document === 'undefined') return null;

  const backdropMotion = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  const panelMotion = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1, scale: 1, y: 0 } }
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
      };

  const panelClasses = unstyled
    ? 'relative w-full outline-none'
    : `bg-neutral-900 rounded-2xl border border-neutral-800 p-8 relative max-h-[90vh] overflow-y-auto w-full outline-none ${sizeToMaxWidth[size]}`;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...backdropMotion}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 motion-reduce:transition-none"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={panelRef}
              {...panelMotion}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              tabIndex={-1}
              className={`${panelClasses} pointer-events-auto motion-reduce:transition-none`}
            >
              <h2 id={titleId} className="sr-only">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="sr-only">
                  {description}
                </p>
              )}
              {!hideCloseButton && (
                <div className="absolute top-4 right-4 z-10">
                  <IconButton
                    label="Close dialog"
                    icon={<X className="w-5 h-5" />}
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  />
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
