'use client';

import Link from 'next/link';
import { Bot, FileText, Users, Activity, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useEffect, useState } from 'react';
import { suiteCore } from '@/core/suite';
import { Status } from '@growly/core';
import { formatDistanceToNow } from 'date-fns';
import { NewWorkflowButton } from '@/components/buttons/new-workflow-button';
import { NewAgentButton } from '@/components/buttons/new-agent-button';

export default function DashboardInner() {
  const { selectedOrganization } = useDashboardState();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalWorkflows: 0,
    runningWorkflows: 0,
    resourceUsage: 0,
  });
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      type: 'agent' | 'workflow' | 'team';
      title: string;
      timestamp: Date;
    }>
  >([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!selectedOrganization) return;
      setLoading(true);

      try {
        // Fetch agents
        const agents = await suiteCore.db.agents.getAllByFields({
          organization_id: selectedOrganization.id,
        });
        const activeAgents = agents.filter(agent => agent.status === Status.Active);

        // Fetch workflows
        const workflows = await suiteCore.db.workflows.getAllByFields({
          organization_id: selectedOrganization.id,
        });
        const runningWorkflows = workflows.filter(workflow => workflow.status === Status.Active);

        setMetrics({
          totalAgents: agents.length,
          activeAgents: activeAgents.length,
          totalWorkflows: workflows.length,
          runningWorkflows: runningWorkflows.length,
          resourceUsage: Math.round((activeAgents.length / (agents.length || 1)) * 100),
        });

        // Get recent activity
        const activity = [
          ...agents.map(agent => ({
            type: 'agent' as const,
            title: `Agent "${agent.name}" ${agent.status === Status.Active ? 'activated' : 'deactivated'}`,
            timestamp: new Date(),
          })),
          ...workflows.map(workflow => ({
            type: 'workflow' as const,
            title: `Workflow "${workflow.name}" ${workflow.status === Status.Active ? 'started' : 'stopped'}`,
            timestamp: new Date(),
          })),
        ]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 3);

        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [selectedOrganization]);

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
            <div className="text-2xl font-bold">{metrics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeAgents} active, {metrics.totalAgents - metrics.activeAgents} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.runningWorkflows} running,{' '}
              {metrics.totalWorkflows - metrics.runningWorkflows} paused
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resourceUsage}%</div>
            <p className="text-xs text-muted-foreground">Agent utilization</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions across your organization</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === 'agent'
                        ? 'bg-blue-100'
                        : activity.type === 'workflow'
                          ? 'bg-green-100'
                          : 'bg-orange-100'
                    }`}>
                    {activity.type === 'agent' ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : activity.type === 'workflow' ? (
                      <FileText className="h-4 w-4 text-green-600" />
                    ) : (
                      <Users className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <NewAgentButton />
              <NewWorkflowButton />
              <Link href="/dashboard/resources">
                <Button variant="outline" className="w-full justify-start">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Manage Resources
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Team
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
