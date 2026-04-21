import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '../utils/currency';
import { toast } from 'sonner';
import { IconButton } from './ui/IconButton';

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
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <IconButton
      label={`Copy ${label || 'text'}`}
      icon={copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      variant="subtle"
      size="sm"
      onClick={handleCopy}
      title={`Copy ${label || 'text'}`}
      className={className}
    />
  );
}
