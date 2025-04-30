import { Card } from '@/components/ui/card';
import { ChatMessage, ChatRole, MessageId } from '@/components/widgets/types';
import { motion } from 'framer-motion';
import AgentAvatar from '../../../agent/components/AgentAvatar';
import { useAppStack } from '@/provider';
import { cn } from '@/lib/utils';

const MessageContent = ({ message }: { message: ChatMessage['message'] }) => {
  if (message.type === 'text') {
    return <p className="text-sm">{message.content}</p>;
  }
  if (
    message.type === 'onchainkit:swap' ||
    message.type === 'onchainkit:token' ||
    message.type === 'onchainkit:identity'
  ) {
    return message.content;
  }
  return null;
};

const AgentResponse = ({ message, id }: { message: ChatMessage; id: MessageId }) => {
  const { config } = useAppStack();
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-2"
      style={{ marginBottom: 10 }}>
      <AgentAvatar width={30} height={30} />
      <Card
        className={cn(
          'p-3 bg-muted',
          message.message.type === 'onchainkit:swap' ? 'w-full' : 'max-w-[75%]'
        )}
        style={{
          backgroundColor: config?.theme?.backgroundForeground,
          color: config?.theme?.textForeground,
        }}>
        <MessageContent message={message.message} />
      </Card>
    </motion.div>
  );
};

const UserResponse = ({ message, id }: { message: ChatMessage; id: MessageId }) => {
  const { config } = useAppStack();
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex"
      style={{ marginBottom: 10, justifyContent: 'flex-end' }}>
      <Card
        className="p-3 max-w-[75%]"
        style={{ backgroundColor: config?.theme?.secondary, color: config?.theme?.text }}>
        <MessageContent message={message.message} />
      </Card>
    </motion.div>
  );
};

const ChatResponse = ({
  message,
  id,
  ref,
}: {
  message: ChatMessage;
  id: MessageId;
  ref?: React.RefObject<HTMLDivElement> | null;
}) => {
  const innerResponse =
    message.from === ChatRole.User ? (
      <UserResponse id={id} key={id} message={message} />
    ) : (
      <AgentResponse id={id} key={id} message={message} />
    );
  return <div ref={ref}>{innerResponse}</div>;
};

export default ChatResponse;
