import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useSuiteSession } from '@/hooks/use-session';
import { cn } from '@/styles/theme';

export const GrowlyDiv = ({
  children,
  onClick,
  triggerMessage,
  withUserMessage,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  triggerMessage: string;
  withUserMessage?: boolean;
}) => {
  const { agent } = useSuiteSession();
  const { generateAgentMessage, sendUserMessage } = useChatActions();
  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      if (withUserMessage) {
        await sendUserMessage(triggerMessage);
      } else {
        await generateAgentMessage(triggerMessage);
      }
      onClick?.(e);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div onClick={handleClick} className={cn('gas-relative', props.className)} {...props}>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>Chat with {agent?.name}</TooltipContent>
      </Tooltip>
    </div>
  );
};
