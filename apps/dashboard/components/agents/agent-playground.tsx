'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/hooks/use-chat-actions';
import { useDashboardState } from '@/hooks/use-dashboard';
import {
  Book,
  Bot,
  Eye,
  MessageCircle,
  Palette,
  Play,
  Settings,
  Sparkles,
  TestTube,
  User,
} from 'lucide-react';
// Import suite components for testing
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'react-toastify';

import {
  AggregatedAgent,
  ConversationRole,
  MessageContent,
  ResourceType,
  TypedResource,
} from '@getgrowly/core';

import { PrimaryButton } from '../buttons/primary-button';
import { ResourceListItem } from '../resources/resource-list-item';

// Dynamically import suite components to avoid SSR issues
const SuiteProvider = dynamic(() => import('@getgrowly/suite').then(suite => suite.SuiteProvider), {
  ssr: false,
});

const ChatWidget = dynamic(() => import('@getgrowly/suite').then(suite => suite.ChatWidget), {
  ssr: false,
});

const GrowlyButton = dynamic(
  () => import('@getgrowly/suite').then(suite => suite.GrowlyComponent.Button),
  { ssr: false }
);

const GrowlyDiv = dynamic(
  () => import('@getgrowly/suite').then(suite => suite.GrowlyComponent.Div),
  { ssr: false }
);

interface AgentPlaygroundProps {
  agent: AggregatedAgent;
}

interface TestMessage {
  id: string;
  content: string;
  sender: ConversationRole;
  timestamp: Date;
  type: MessageContent['type'];
}

export function AgentPlayground({ agent }: AgentPlaygroundProps) {
  const { admin } = useDashboardState();
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [testContext, setTestContext] = useState('default');
  const [isBeastMode, setIsBeastMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [widgetTheme, setWidgetTheme] = useState('default');
  const [widgetDisplay, setWidgetDisplay] = useState('panel');

  const addTestMessage = (message: Omit<TestMessage, 'id' | 'timestamp'>) => {
    const newMessage: TestMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    setTestMessages(prev => [...prev, newMessage]);
  };

  const clearTestMessages = () => {
    setTestMessages([]);
  };

  const sendTestMessage = async () => {
    if (!inputMessage.trim() || isAgentThinking || !admin) return;

    // Add user message
    addTestMessage({
      content: inputMessage,
      sender: ConversationRole.User,
      type: 'text',
    });

    const userInput = inputMessage;
    setInputMessage('');
    setIsAgentThinking(true);

    try {
      // Call the chat service
      const response = await chatService.chat({
        message: userInput,
        agentId: agent.id,
        userId: admin.id,
        stepId: agent.id,
        isBeastMode,
      });

      // Add agent response
      if (response.reply.agent) {
        addTestMessage({
          content: response.reply.agent,
          sender: ConversationRole.Agent,
          type: 'text',
        });
      }

      // Add tool responses
      if (response.reply.tools && response.reply.tools.length > 0) {
        response.reply.tools.forEach(tool => {
          addTestMessage({
            content: JSON.stringify(tool.content, null, 2),
            sender: ConversationRole.Agent,
            type: tool.type,
          });
        });
      }

      toast.success('Agent response received!');
    } catch (error: any) {
      console.error('Chat error:', error);
      addTestMessage({
        content: `Error: ${error.message || 'Failed to get agent response'}`,
        sender: ConversationRole.Agent,
        type: 'system:error',
      });
      toast.error('Failed to get agent response');
    } finally {
      setIsAgentThinking(false);
    }
  };

  const generateTemplateMessage = () => {
    const templates = [
      'Hello! Can you help me understand my portfolio?',
      'What are the best DeFi protocols right now?',
      'Can you analyze the risk of my current holdings?',
      'How should I rebalance my portfolio?',
      "What's the latest in Web3 news?",
      'Can you explain how Uniswap works?',
      'What are the benefits of staking?',
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setInputMessage(randomTemplate);
  };

  const getResourceContext = () => {
    if (selectedResource === 'all') {
      return agent.resources || [];
    }
    return (agent.resources || []).filter(r => r.id === selectedResource);
  };

  const handleWidgetEvent = (event: string) => {
    addTestMessage({
      content: `Widget event triggered: ${event}`,
      sender: ConversationRole.User,
      type: 'text',
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-primary" />
            Agent Playground
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Test your agent's responses, actions, and widget styles in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={clearTestMessages}>
            Clear Chat
          </Button>
          <PrimaryButton onClick={generateTemplateMessage}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Template
          </PrimaryButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat Testing
          </TabsTrigger>
          <TabsTrigger value="widget">
            <Eye className="mr-2 h-4 w-4" />
            Widget Testing
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Chat Testing Tab */}
        <TabsContent value="chat" className="space-y-6 mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Configuration */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Test Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resource-select">Test with Resources</Label>
                    <Select value={selectedResource} onValueChange={setSelectedResource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Resources ({(agent.resources || []).length})
                        </SelectItem>
                        {(agent.resources || []).map(resource => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name} ({resource.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context-select">Test Context</Label>
                    <Select value={testContext} onValueChange={setTestContext}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select context" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Context</SelectItem>
                        <SelectItem value="defi">DeFi Focused</SelectItem>
                        <SelectItem value="portfolio">Portfolio Analysis</SelectItem>
                        <SelectItem value="general">General Web3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="beast-mode"
                      checked={isBeastMode}
                      onChange={e => setIsBeastMode(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="beast-mode">Beast Mode (Advanced AI)</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Available Resources
                  </CardTitle>
                  <CardDescription>
                    Resources that will be available to the agent during testing. Assigned in the
                    agent details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getResourceContext().length > 0 ? (
                    <div className="space-y-2">
                      {getResourceContext().map(resource => (
                        <ResourceListItem
                          key={resource.id}
                          resource={resource as TypedResource<ResourceType>}
                          noPreview
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resources available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Test Chat
                  </CardTitle>
                  <CardDescription>Send messages to test how your agent responds</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {testMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Bot className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Start Testing Your Agent</p>
                        <p className="text-sm">Send a message to see how your agent responds</p>
                      </div>
                    ) : (
                      testMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender === ConversationRole.User
                              ? 'justify-end'
                              : 'justify-start'
                          }`}>
                          {message.sender === ConversationRole.Agent && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}

                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === ConversationRole.User
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                            <div className="text-sm">
                              {message.type === 'text' ? (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              ) : (
                                <pre className="text-xs overflow-x-auto">{message.content}</pre>
                              )}
                            </div>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>

                          {message.sender === ConversationRole.User && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {isAgentThinking && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: '0.1s' }}
                            />
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        placeholder="Type your test message here..."
                        className="flex-1"
                        rows={2}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendTestMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendTestMessage}
                        disabled={!inputMessage.trim() || isAgentThinking}
                        className="px-6">
                        {isAgentThinking ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Widget Testing Tab */}
        <TabsContent value="widget" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Widget Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Widget Configuration
                </CardTitle>
                <CardDescription>Customize how your widgets look and behave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme-select">Theme</Label>
                  <Select value={widgetTheme} onValueChange={setWidgetTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-select">Display Mode</Label>
                  <Select value={widgetDisplay} onValueChange={setWidgetDisplay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panel">Panel</SelectItem>
                      <SelectItem value="fullView">Full View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Widget Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Widget Preview
                </CardTitle>
                <CardDescription>See how your widgets will look to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Growly Button</h4>
                    {GrowlyButton && (
                      <GrowlyButton
                        triggerMessage="Hello from the playground!"
                        onClick={() => handleWidgetEvent('GrowlyButton clicked')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Test Button
                      </GrowlyButton>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Growly Div</h4>
                    {GrowlyDiv && (
                      <GrowlyDiv
                        triggerMessage="Div interaction triggered!"
                        onClick={() => handleWidgetEvent('GrowlyDiv clicked')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                        Click me to test interactions
                      </GrowlyDiv>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Chat Widget</h4>
                    <div className="h-64 border rounded-lg bg-muted/50 flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Chat widget preview (requires full integration)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Agent Configuration
              </CardTitle>
              <CardDescription>View and modify agent settings for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Agent Name</Label>
                  <p className="text-sm text-muted-foreground">{agent.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Model</Label>
                  <p className="text-sm text-muted-foreground">{agent.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resources</Label>
                  <p className="text-sm text-muted-foreground">
                    {(agent.resources || []).length} attached
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {agent.description || 'No description provided'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
