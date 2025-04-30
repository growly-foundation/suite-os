'use client';
import React from 'react';
import { ChatPanel, AppStackProvider, DemoChatWidget, StaticWidget, Theme } from '@growly/appstack';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const WidgetContainer = () => {
  return (
    <AppStackProvider
      config={{
        agent: {
          name: 'Test Agent',
          avatar: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
        },
        theme: Theme.monoTheme,
      }}>
      <div className="flex flex-col justify-center items-center w-full">
        <Tabs defaultValue="chat-widget">
          <TabsList>
            <TabsTrigger value="chat-widget">Chat Widget</TabsTrigger>
            <TabsTrigger value="demo-chat-widget">Demo Chat Widget</TabsTrigger>
            <TabsTrigger value="static-widget">Static Widget</TabsTrigger>
            <TabsContent value="chat-widget">
              <ChatPanel onClose={() => {}} onSend={() => {}} messages={[]} />
            </TabsContent>
            <TabsContent value="demo-chat-widget">
              <DemoChatWidget defaultOpen={true} />
            </TabsContent>
            <TabsContent value="static-widget">
              <StaticWidget />
            </TabsContent>
          </TabsList>
        </Tabs>
      </div>
    </AppStackProvider>
  );
};

export default WidgetContainer;
