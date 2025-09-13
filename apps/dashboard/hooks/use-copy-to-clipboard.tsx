import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for copy functionality with visual feedback
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  return { copyToClipboard, copied };
}
