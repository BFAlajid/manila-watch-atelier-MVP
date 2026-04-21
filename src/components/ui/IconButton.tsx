import { forwardRef } from 'react';

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-labelledby'>;

export interface IconButtonProps extends ButtonProps {
  label: string;
  icon: React.ReactNode;
  adornment?: React.ReactNode;
  variant?: 'ghost' | 'filled' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'danger';
}

const sizeClasses: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'min-h-[36px] min-w-[36px] p-2',
  md: 'min-h-[44px] min-w-[44px] p-2.5',
  lg: 'min-h-[48px] min-w-[48px] p-3',
};

const variantClasses: Record<NonNullable<IconButtonProps['variant']>, string> = {
  ghost: 'text-neutral-400 hover:text-white',
  filled: 'bg-white/10 hover:bg-white/20 text-white rounded-full',
  subtle: 'text-neutral-500 hover:text-[#D4AF37]',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, adornment, variant = 'ghost', size = 'md', tone = 'default', className, type = 'button', ...rest },
  ref
) {
  const base =
    'relative inline-flex items-center justify-center rounded-lg motion-safe:transition-colors motion-safe:duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
  const toneOverride = tone === 'danger' ? 'hover:text-red-400' : '';
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${toneOverride} ${className || ''}`.trim()}
      {...rest}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="pointer-events-none inline-flex">
        {icon}
      </span>
      {adornment}
    </button>
  );
});
