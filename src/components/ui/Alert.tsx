export interface AlertProps {
  tone: 'error' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<AlertProps['tone'], string> = {
  error: 'border border-red-500/40 bg-red-500/10 text-red-200',
  success: 'border border-green-500/40 bg-green-500/10 text-green-200',
  info: 'border border-blue-500/40 bg-blue-500/10 text-blue-200',
};

export function Alert({ tone, title, children, className }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg p-3 text-sm ${toneClasses[tone]} ${className || ''}`.trim()}
    >
      {title && <p className="font-medium mb-1">{title}</p>}
      {children}
    </div>
  );
}
