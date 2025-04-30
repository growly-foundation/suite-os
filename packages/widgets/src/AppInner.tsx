'use client';
import { ChatWidget, DemoChatWidget, StaticWidget, WidgetConfigProvider } from 'lib/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { useState } from 'react';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Controls } from './Controls';
import 'lib/index.css';

export function AppInner() {
  const [defaultOpen, setDefaultOpen] = useState(true);

  return (
    <WidgetConfigProvider>
      <div className="flex flex-col justify-center items-center w-full">
        <div className="flex items-center space-x-2">
          <Switch onCheckedChange={checked => setDefaultOpen(checked)} checked={defaultOpen} />
          <Label htmlFor="airplane-mode">Default Open</Label>
        </div>
        <Controls />
        <Tabs defaultValue="chat-widget">
          <TabsList>
            <TabsTrigger value="chat-widget">Chat Widget</TabsTrigger>
            <TabsTrigger value="demo-chat-widget">Demo Chat Widget</TabsTrigger>
            <TabsTrigger value="static-widget">Static Widget</TabsTrigger>
            <TabsContent value="chat-widget">
              <ChatWidget defaultOpen={defaultOpen} />
            </TabsContent>
            <TabsContent value="demo-chat-widget">
              <DemoChatWidget defaultOpen={defaultOpen} />
            </TabsContent>
            <TabsContent value="static-widget">
              <StaticWidget />
            </TabsContent>
          </TabsList>
        </Tabs>
      </div>
    </WidgetConfigProvider>
  );
}
