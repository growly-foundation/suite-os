'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAgentById } from '@/lib/data/mock';
import { Agent, AggregatedAgent, Status } from '@growly/core';
import { AgentForm } from '@/components/agents/agent-form';
import { AgentWorkflows } from '@/components/agents/agent-workflows';
import { AgentResources } from '@/components/agents/agent-resources';

export default function AgentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [agent, setAgent] = useState<AggregatedAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const isNewAgent = params.id === 'new';

  useEffect(() => {
    // In a real app, you would fetch the agent data from your API
    if (isNewAgent) {
      // Create a new agent template
      setAgent({
        id: '',
        name: '',
        model: '',
        description: '',
        organization_id: '1', // Default to the first organization
        resources: [],
        workflows: [],
        status: Status.Inactive,
        created_at: new Date().toISOString(),
      });
    } else {
      const fetchedAgent = getAgentById(params.id);
      if (fetchedAgent) {
        setAgent(fetchedAgent);
      } else {
        // Handle agent not found
        router.push('/dashboard');
      }
    }
    setLoading(false);
  }, [params.id, router]);

  const handleSave = (updatedAgent: Agent) => {
    // In a real app, you would save the agent data to your API
    console.log('Saving agent:', updatedAgent);
    // Redirect to the dashboard after saving
    router.push('/dashboard');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!agent) {
    return <div className="flex items-center justify-center h-full">Agent not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNewAgent ? 'Create Agent' : `Edit Agent: ${agent.name}`}
        </h1>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        {!isNewAgent && (
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
              <CardDescription>Manage your agent's basic information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <AgentForm agent={agent} onSave={handleSave} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="workflows">
          <AgentWorkflows agent={agent} onUpdate={handleSave} />
        </TabsContent>
        <TabsContent value="resources">
          <AgentResources agent={agent} onUpdate={handleSave} />
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>View this agent's activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Activity logs will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
