import dynamic from 'next/dynamic';
import { ChatWidgetDemoLayout } from './ChatWidgetDemoLayout';

const DemoChatWidget = dynamic(() => import('@growly/suite').then(suite => suite.DemoChatWidget), {
  ssr: false,
});

export function DemoChatWidgetDemo() {
  return (
    <ChatWidgetDemoLayout>
      <DemoChatWidget defaultOpen />
    </ChatWidgetDemoLayout>
  );
}
