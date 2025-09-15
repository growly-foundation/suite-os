import { PanelContainer } from '@/components/panel/components/PanelContainer';
import { SuiteContext } from '@/components/providers/SuiteProvider';
import { useRealtime } from '@/hooks';
import { useSuiteSession } from '@/hooks/use-session';
import { useContext, useEffect } from 'react';

import { FloatingButton } from './FloatingButton';

function ChatWidgetContainer() {
  const { togglePanel, agent, user, fetchMessages } = useSuiteSession();
  const suiteContext = useContext(SuiteContext);
  const { messages: realtimeMessages } = useRealtime({
    serverUrl: process.env.NEXT_PUBLIC_SUITE_API_URL || 'http://localhost:8888',
    userId: user?.id || '',
    autoConnect: true,
    onMessage: message => {
      console.log('message', message);
    },
    onPresence: presence => {
      console.log('presence', presence);
    },
    onTyping: typing => {
      console.log('typing', typing);
    },
  });

  // Check if we're inside a SuiteProvider
  const isInsideSuiteProvider = suiteContext.agentId !== '';

  useEffect(() => {
    if (agent?.id && user?.id) {
      fetchMessages();
    }
  }, [agent?.id, user?.id, realtimeMessages]);

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

function ChatWidget() {
  return (
    <div className="gas-style-container">
      <ChatWidgetContainer />
    </div>
  );
}

export { ChatWidget, ChatWidgetContainer };
