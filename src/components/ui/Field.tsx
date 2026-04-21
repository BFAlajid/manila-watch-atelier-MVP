import { cloneElement, isValidElement, useId } from 'react';

export interface FieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export function Field({ label, name, error, hint, required, children, className }: FieldProps) {
  const baseId = useId();
  const id = `field-${name}-${baseId}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  if (!isValidElement(children)) {
    throw new Error('<Field> requires a single React element child (input, select, or textarea).');
  }

  const mergedChild = cloneElement(children as any, {
    id,
    name,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm text-neutral-400 mb-1">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-[#D4AF37]">
            *
          </span>
        )}
      </label>
      {mergedChild}
      {hint && (
        <p id={hintId} className="text-xs text-neutral-500 mt-1">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
