import { Button } from '@/components/ui/button';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const GrowlyButton = ({
  children,
  onClick,
  triggerMessage,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  triggerMessage: string;
}) => {
  const [loading, setLoading] = useState(false);
  const { sendUserMessage } = useChatActions();
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendUserMessage(triggerMessage);
      onClick?.(e);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };
  return (
    <Button onClick={handleClick} disabled={loading} {...props}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {loading ? null : children}
    </Button>
  );
};
