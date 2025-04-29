'use client';
import { ChatWidget, DemoChatWidget, StaticWidget, Theme, WidgetConfigProvider } from 'lib/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { useState } from 'react';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';

export function AppInner() {
  const [defaultOpen, setDefaultOpen] = useState(true);
  return (
    <WidgetConfigProvider
      config={{
        agent: {
          name: 'Growly Copilot',
          avatar: '/logos/growly-contrast.png',
        },
        theme: Theme.monoTheme,
      }}>
      <div className="flex justify-center items-center flex-col w-full">
        <StaticWidget />
        <div className="flex items-center space-x-2">
          <Switch onCheckedChange={checked => setDefaultOpen(checked)} checked={defaultOpen} />
          <Label htmlFor="airplane-mode">Default Open</Label>
        </div>
        <Tabs defaultValue="chat-widget" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="chat-widget">Chat Widget</TabsTrigger>
            <TabsTrigger value="demo-chat-widget">Demo Chat Widget</TabsTrigger>
            <TabsTrigger value="static-widget">Static Widget</TabsTrigger>
          </TabsList>
          <TabsContent value="chat-widget">
            <ChatWidget defaultOpen={defaultOpen} />
          </TabsContent>
          <TabsContent value="demo-chat-widget">
            <DemoChatWidget defaultOpen={defaultOpen} />
          </TabsContent>
          <TabsContent value="static-widget">
            <StaticWidget />
          </TabsContent>
        </Tabs>
      </div>
    </WidgetConfigProvider>
  );
}
