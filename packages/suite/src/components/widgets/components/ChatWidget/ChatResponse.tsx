import { Card } from '@/components/ui/card';
import { ConversationRole, MessageId, ParsedMessage } from '@growly/core';
import { motion } from 'framer-motion';
import AgentAvatar from '../../../agent/components/AgentAvatar';
import { useSuite } from '@/provider';
import { cn } from '@/lib/utils';
import {
  buildOnchainKitSwapMessage,
  buildOnchainKitTokenChipMessage,
} from '@/components/messages/onchainkit';
import { border, text } from '@/styles/theme';

const MessageContent = ({ message }: { message: ParsedMessage }) => {
  const { config } = useSuite();
  const onchainKitEnabled = config?.onchainKit?.enabled;
  if (message.type === 'text') {
    return <p className="text-sm">{message.content}</p>;
  }
  if (!onchainKitEnabled) {
    return (
      <span className="text-sm font-semibold">
        ⚠️ OnchainKit feature must be enabled to display this message.
      </span>
    );
  }
  if (message.type === 'onchainkit:swap') {
    return buildOnchainKitSwapMessage(message.content);
  }
  if (message.type === 'onchainkit:token') {
    return buildOnchainKitTokenChipMessage(message.content);
  }
  return <></>;
};

const AgentResponse = ({ message, id }: { message: ParsedMessage; id: MessageId }) => {
  const { config } = useSuite();
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
          message.type === 'onchainkit:swap' ? 'w-full' : 'max-w-[75%]',
          text.body,
          border.default
        )}
        style={{
          backgroundColor: config?.theme?.backgroundForeground,
          color: config?.theme?.textForeground,
        }}>
        <MessageContent message={message} />
      </Card>
    </motion.div>
  );
};

const UserResponse = ({ message, id }: { message: ParsedMessage; id: MessageId }) => {
  const { config } = useSuite();
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex"
      style={{ marginBottom: 10, justifyContent: 'flex-end' }}>
      <Card
        className={cn('p-3 max-w-[75%]', text.body, border.default)}
        style={{
          backgroundColor: config?.theme?.secondary,
          color: config?.theme?.text,
        }}>
        <MessageContent message={message} />
      </Card>
    </motion.div>
  );
};

const ChatResponse = ({
  message,
  id,
  ref,
}: {
  message: ParsedMessage;
  id: MessageId;
  ref?: React.RefObject<HTMLDivElement> | null;
}) => {
  const innerResponse =
    message.sender === ConversationRole.User ? (
      <UserResponse id={id} key={id} message={message} />
    ) : (
      <AgentResponse id={id} key={id} message={message} />
    );
  return <div ref={ref}>{innerResponse}</div>;
};

export default ChatResponse;
