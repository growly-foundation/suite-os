import { useChatActions } from '@/hooks/use-chat-actions';

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
    <div onClick={handleClick} {...props}>
      {children}
    </div>
  );
};
