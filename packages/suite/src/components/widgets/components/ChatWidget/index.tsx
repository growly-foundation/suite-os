import { FloatingButton } from './FloatingButton';
import { useSuiteSession } from '@/hooks/use-session';
import { PanelContainer } from '@/components/panel/components/PanelContainer';
import { useEffect } from 'react';

function ChatWidgetContainer({
  buttonProps,
}: {
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  const { togglePanel, agent, user, fetchMessages } = useSuiteSession();

  useEffect(() => {
    if (agent?.id && user?.id) {
      fetchMessages();
    }
  }, [agent?.id, user?.id]);

  return (
    <div>
      <FloatingButton onClick={togglePanel} {...buttonProps} />
      <PanelContainer />
    </div>
  );
}

function ChatWidget(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <ChatWidgetContainer buttonProps={props} />;
}

export { ChatWidgetContainer, ChatWidget };
