import { PanelContainer } from '@/components/panel/components/PanelContainer';
import { SuiteContext } from '@/components/providers/SuiteProvider';
import { useSuiteSession } from '@/hooks/use-session';
import { useContext, useEffect } from 'react';

import { FloatingButton } from './FloatingButton';

function ChatWidgetContainer({
  buttonProps,
}: {
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  const { togglePanel, agent, user, fetchMessages } = useSuiteSession();
  const suiteContext = useContext(SuiteContext);

  // Check if we're inside a SuiteProvider
  const isInsideSuiteProvider = suiteContext.agentId !== '';

  useEffect(() => {
    if (agent?.id && user?.id) {
      fetchMessages();
    }
  }, [agent?.id, user?.id]);

  const content = (
    <>
      <FloatingButton onClick={togglePanel} iconLoading={false} />
      <PanelContainer />
    </>
  );

  // Only wrap with gas-theme if not inside SuiteProvider
  if (isInsideSuiteProvider) {
    return <div>{content}</div>;
  }

  return <div className="gas-theme light">{content}</div>;
}

function ChatWidget(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <div className="gas-style-container">
      <ChatWidgetContainer buttonProps={props} />
    </div>
  );
}

export { ChatWidget, ChatWidgetContainer };
