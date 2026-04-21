import { useEffect } from 'react';

// Ref-counted scroll lock. Multiple simultaneous locks (nested modals, lightbox +
// chat panel, etc.) all share a single counter so the last unlock restores scroll.

let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

function acquire() {
  if (lockCount === 0 && typeof document !== 'undefined') {
    const body = document.body;
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;

    // Compensate for the scrollbar width so the layout does not shift when
    // overflow is hidden. Only needed when the page actually overflows.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const currentPR = parseFloat(getComputedStyle(body).paddingRight || '0');
      body.style.paddingRight = `${currentPR + scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  }
}

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    acquire();
    return () => release();
  }, [active]);
}
