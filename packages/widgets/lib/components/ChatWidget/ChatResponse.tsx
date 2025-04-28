import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ChatMessage, ChatRole, MessageId } from 'lib/types';
import { motion } from 'framer-motion';

const AgentResponse = ({ message, id }: { message: ChatMessage; id: MessageId }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2"
      style={{ marginBottom: 10 }}>
      <Avatar className="h-8 w-8">
        <AvatarImage src="/support-avatar.png" />
        <AvatarFallback>🤖</AvatarFallback>
      </Avatar>
      <Card className="p-3 max-w-[75%] bg-muted">
        <p className="text-sm">{message.content}</p>
      </Card>
    </motion.div>
  );
};

const UserResponse = ({ message, id }: { message: ChatMessage; id: MessageId }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex"
      style={{ marginBottom: 10, justifyContent: 'flex-end' }}>
      <Card className="p-3 max-w-[75%] bg-primary text-primary-foreground">
        <p className="text-sm">{message.content}</p>
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
