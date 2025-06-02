import { RenderMessage } from '@/components/messages';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';
import { motion } from 'framer-motion';

import { ConversationRole, ParsedMessage, User } from '@getgrowly/core';
import { AdminAvatar, RandomAvatar, SuiteUser } from '@getgrowly/ui';

const ChatResponseAvatar = ({
  showAvatar,
  children,
}: {
  showAvatar?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex-shrink-0 pt-2">
      {showAvatar ? children : <div style={{ width: 30, height: 30 }} />}
    </div>
  );
};

const RightResponseLayout = ({
  message,
  showAvatar = true,
  avatar,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
  avatar: React.ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <motion.div
      id={message.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-2"
      style={{
        marginBottom: 10,
        justifyContent: 'flex-end',
      }}>
      <Card
        className={cn('py-2 px-4 mb-2 max-w-[80%]', text.body)}
        style={{
          backgroundColor: theme.background.default,
          color: theme.text.primary,
          borderColor: theme.ui.border.default,
          borderRadius: theme.radius.lg,
        }}>
        <RenderMessage message={message} />
      </Card>
      <ChatResponseAvatar showAvatar={showAvatar}>{avatar}</ChatResponseAvatar>
    </motion.div>
  );
};

const LeftResponseLayout = ({
  message,
  showAvatar = true,
  avatar,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
  avatar: React.ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <motion.div
      id={message.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-2"
      style={{ marginBottom: showAvatar ? 10 : 2 }}>
      <ChatResponseAvatar showAvatar={showAvatar}>{avatar}</ChatResponseAvatar>
      <Card
        className={cn('py-2 px-4 mb-2', text.body)}
        style={{
          backgroundColor: theme.background.paper,
          color: theme.text.primary,
          border: 'none',
          boxShadow: 'none',
        }}>
        <RenderMessage message={message} />
      </Card>
    </motion.div>
  );
};

const AgentResponse = ({
  message,
  showAvatar = true,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
}) => {
  return (
    <LeftResponseLayout
      message={message}
      showAvatar={showAvatar}
      avatar={<SuiteUser width={30} height={30} style={{ minWidth: 30, minHeight: 30 }} />}
    />
  );
};

const UserResponse = ({
  address,
  message,
  showAvatar = true,
}: {
  address: string;
  message: ParsedMessage;
  showAvatar?: boolean;
}) => {
  const { theme } = useTheme();
  return (
    <RightResponseLayout
      message={message}
      showAvatar={showAvatar}
      avatar={<RandomAvatar address={address as any} size={35} />}
    />
  );
};

const AdminResponse = ({
  message,
  showAvatar = true,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
}) => {
  return (
    <LeftResponseLayout
      message={message}
      showAvatar={showAvatar}
      avatar={<AdminAvatar size={35} email={'123'} />}
    />
  );
};

const ChatResponse = ({
  message,
  viewAs,
  showAvatar = true,
  ref,
  user,
}: {
  message: ParsedMessage;
  viewAs: ConversationRole;
  showAvatar?: boolean;
  ref?: React.RefObject<HTMLDivElement> | null;
  user: User;
}) => {
  switch (message.sender) {
    case ConversationRole.User:
      return (
        <div ref={ref} className="w-full">
          <UserResponse
            key={message.id}
            address={user?.address}
            message={message}
            showAvatar={showAvatar && viewAs !== ConversationRole.User}
          />
        </div>
      );
    case ConversationRole.Agent:
      return (
        <div ref={ref} className="w-full">
          <AgentResponse key={message.id} message={message} showAvatar={showAvatar} />
        </div>
      );
    default:
      return (
        <div ref={ref} className="w-full">
          <AdminResponse
            key={message.id}
            message={message}
            showAvatar={showAvatar && viewAs !== ConversationRole.User}
          />
        </div>
      );
  }
};

export default ChatResponse;
