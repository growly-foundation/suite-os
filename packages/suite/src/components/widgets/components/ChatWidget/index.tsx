import { useEffect } from 'react';
import { FloatingButton } from './FloatingButton';
import { ChatPanelContainer, ChatPanel } from './ChatPanel';
import { useWidgetSession } from '@/hooks/use-session';

function ChatWidgetContainer({
  buttonProps,
}: {
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  const { togglePanel } = useWidgetSession();
  return (
    <div>
      <FloatingButton onClick={togglePanel} {...buttonProps} />
      <ChatPanelContainer />
    </div>
  );
}

function ChatWidget(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { agent, user, fetchMessages } = useWidgetSession();

  useEffect(() => {
    if (agent?.id && user?.id) {
      fetchMessages();
    }
  }, [agent?.id, user?.id]);

  return <ChatWidgetContainer buttonProps={props} />;
}

export { ChatPanel, ChatWidgetContainer, ChatWidget };
