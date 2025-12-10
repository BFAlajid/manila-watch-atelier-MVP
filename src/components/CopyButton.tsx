import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '../utils/currency';
import { toast } from 'sonner@2.0.3';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      toast.success(`${label || 'Text'} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-[#D4AF37] transition-colors ${className}`}
      title={`Copy ${label || 'text'}`}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}
