import React from 'react';
import { ChatWidget, StaticWidget } from '@growly/widget/dist/main';

const WidgetContainer = () => {
  return (
    <div>
      <ChatWidget />
      <StaticWidget />
    </div>
  );
};

export default WidgetContainer;
