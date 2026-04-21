import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[#D4AF37] text-black hover:bg-[#F4E5B8]',
  secondary: 'border border-neutral-700 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] bg-transparent',
  ghost: 'text-neutral-300 hover:text-white hover:bg-white/5',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-1.5 text-sm min-w-[72px]',
  md: 'px-6 py-2.5 min-w-[96px]',
  lg: 'px-6 py-3 min-w-[96px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg motion-safe:transition-colors motion-safe:duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${width} ${className || ''}`.trim()}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        <>
          {leftIcon && (
            <span aria-hidden="true" className="pointer-events-none inline-flex">
              {leftIcon}
            </span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span aria-hidden="true" className="pointer-events-none inline-flex">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});
