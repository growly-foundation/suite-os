'use client';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, FileText, Users } from 'lucide-react';
import { useDashboardState } from '@/hooks/use-dashboard';
import { AgentsList } from '@/components/agents/agent-list';

export default function DashboardInner() {
  const { selectedOrganization } = useDashboardState();

  return (
    <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{selectedOrganization?.name}</h1>
        <p className="text-muted-foreground">{selectedOrganization?.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            {/* <p className="text-xs text-muted-foreground">+2 from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            {/* <p className="text-xs text-muted-foreground">+5 from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            {/* <p className="text-xs text-muted-foreground">+1 from last month</p> */}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <Link href="/dashboard/agents/new">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </Link>
        </div>
        <TabsContent value="agents" className="space-y-4">
          <AgentsList />
        </TabsContent>
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
              <CardDescription>View and manage your organization's workflows.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No workflows to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>View and manage your organization's resources.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No resources to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
