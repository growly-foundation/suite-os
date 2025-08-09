import { RenderMessage, RenderMessageContent } from '@/components/messages';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { suiteCoreService } from '@/services/core.service';
import { text } from '@/styles/theme';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Admin, ConversationRole, ParsedMessage, ParsedUser } from '@getgrowly/core';
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
  noAvatar = false,
  avatar,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
  noAvatar?: boolean;
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
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}>
        <RenderMessage message={message} />
      </Card>
      {!noAvatar && <ChatResponseAvatar showAvatar={showAvatar}>{avatar}</ChatResponseAvatar>}
    </motion.div>
  );
};

const LeftResponseLayout = ({
  message,
  showAvatar = true,
  noAvatar = false,
  avatar,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
  noAvatar?: boolean;
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
      {!noAvatar && <ChatResponseAvatar showAvatar={showAvatar}>{avatar}</ChatResponseAvatar>}
      <Card
        className={cn('py-2 px-4 mb-2', text.body)}
        style={{
          backgroundColor: theme.background.paper,
          color: theme.text.primary,
          border: 'none',
          boxShadow: 'none',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}>
        <RenderMessage message={message} />
      </Card>
    </motion.div>
  );
};

// Custom component to handle agent messages with all tool outputs
const AgentMessageWithTools = ({
  textMessage,
  toolMessages,
  showAvatar = true,
  noAvatar = false,
}: {
  textMessage: ParsedMessage;
  toolMessages: ParsedMessage[];
  showAvatar?: boolean;
  noAvatar?: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <motion.div
      id={textMessage.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-2"
      style={{ marginBottom: showAvatar ? 10 : 2 }}>
      {!noAvatar && (
        <ChatResponseAvatar showAvatar={showAvatar}>
          <SuiteUser width={30} height={30} style={{ minWidth: 30, minHeight: 30 }} />
        </ChatResponseAvatar>
      )}
      <div className="flex-1">
        {/* Agent message in grey card */}
        <Card
          className={cn('py-2 px-4 mb-2', text.body)}
          style={{
            backgroundColor: theme.background.paper,
            color: theme.text.primary,
            border: 'none',
            boxShadow: 'none',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}>
          <RenderMessage message={textMessage} />
        </Card>

        {/* All tool outputs outside the card */}
        {toolMessages.length > 0 && (
          <div className="ml-0 space-y-2">
            {toolMessages.map(toolMessage => (
              <div key={toolMessage.id}>
                <RenderMessageContent message={toolMessage} />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AgentResponse = ({
  message,
  showAvatar = true,
  noAvatar = false,
  toolMessages,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
  noAvatar?: boolean;
  toolMessages?: ParsedMessage[];
}) => {
  // If this is a text message with tool outputs, use the special component
  if (message.type === 'text' && toolMessages && toolMessages.length > 0) {
    return (
      <AgentMessageWithTools
        textMessage={message}
        toolMessages={toolMessages}
        showAvatar={showAvatar}
        noAvatar={noAvatar}
      />
    );
  }

  // For non-text messages or messages without tools, use the normal layout
  return (
    <LeftResponseLayout
      message={message}
      showAvatar={showAvatar}
      noAvatar={noAvatar}
      avatar={<SuiteUser width={30} height={30} style={{ minWidth: 30, minHeight: 30 }} />}
    />
  );
};

const UserResponse = ({
  address,
  message,
  showAvatar = true,
  noAvatar = false,
}: {
  address: string;
  message: ParsedMessage;
  showAvatar?: boolean;
  noAvatar?: boolean;
}) => {
  return (
    <RightResponseLayout
      message={message}
      showAvatar={showAvatar}
      noAvatar={noAvatar}
      avatar={<RandomAvatar address={address as any} size={35} />}
    />
  );
};

const AdminResponse = ({
  message,
  showAvatar = true,
  noAvatar = false,
}: {
  message: ParsedMessage;
  showAvatar?: boolean;
  noAvatar?: boolean;
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!message.sender_id) return;
      const admin = await suiteCoreService.callDatabaseService('admins', 'getOneByFields', [
        { id: message.sender_id },
      ]);
      setAdmin(admin);
      setLoading(false);
    };
    fetchAdmin();
  }, [message.sender_id]);

  return (
    <LeftResponseLayout
      message={message}
      showAvatar={showAvatar}
      noAvatar={noAvatar}
      avatar={
        loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <AdminAvatar size={35} email={admin?.email || ''} />
        )
      }
    />
  );
};

const ChatResponse = ({
  message,
  viewAs,
  showAvatar = true,
  ref,
  user,
  toolMessages,
}: {
  message: ParsedMessage;
  viewAs: ConversationRole;
  showAvatar?: boolean;
  ref?: React.RefObject<HTMLDivElement> | null;
  user: ParsedUser;
  toolMessages?: ParsedMessage[];
}) => {
  switch (message.sender) {
    case ConversationRole.User:
      return (
        <div ref={ref} className="w-full">
          <UserResponse
            key={message.id}
            address={user?.entities.walletAddress}
            message={message}
            noAvatar={viewAs === ConversationRole.User}
            showAvatar={showAvatar && viewAs !== ConversationRole.User}
          />
        </div>
      );
    case ConversationRole.Agent:
      return (
        <div ref={ref} className="w-full">
          <AgentResponse
            key={message.id}
            message={message}
            noAvatar={viewAs === ConversationRole.Agent}
            showAvatar={showAvatar && viewAs !== ConversationRole.Agent}
            toolMessages={toolMessages}
          />
        </div>
      );
    case ConversationRole.Admin:
      return (
        <div ref={ref} className="w-full">
          <AdminResponse key={message.id} message={message} showAvatar={showAvatar} />
        </div>
      );
  }
};

export default ChatResponse;
