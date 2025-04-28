import './index.css';
import { ChatWidget, DemoChatWidget, StaticWidget } from '../lib/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  return (
    <div className="flex justify-center items-center flex-col w-full">
      <StaticWidget />
      <Tabs defaultValue="chat-widget" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="chat-widget">Chat Widget</TabsTrigger>
          <TabsTrigger value="demo-chat-widget">Demo Chat Widget</TabsTrigger>
          <TabsTrigger value="static-widget">Static Widget</TabsTrigger>
        </TabsList>
        <TabsContent value="chat-widget">
          <ChatWidget />
        </TabsContent>
        <TabsContent value="demo-chat-widget">
          <DemoChatWidget />
        </TabsContent>
        <TabsContent value="static-widget">
          <StaticWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
