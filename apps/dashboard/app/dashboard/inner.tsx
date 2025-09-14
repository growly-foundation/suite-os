'use client';

import { AppUserAvatarWithStatus } from '@/components/app-users/app-user-avatar-with-status';
import { MessageListCard } from '@/components/conversations/message-list-card';
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state';
import { GrowthRetentionChart } from '@/components/dashboard/growth-retention-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconContainer } from '@/components/ui/icon-container';
import type { TimeRange } from '@/components/ui/time-range-selector';
import { TimeRangeSelector } from '@/components/ui/time-range-selector';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useDashboardDataQueries } from '@/hooks/use-dashboard-queries';
import {
  Activity as ActivityIcon,
  Bot,
  RefreshCw,
  Settings2,
  User2Icon,
  WorkflowIcon,
} from 'lucide-react';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { Agent, AggregatedWorkflow, ParsedUser, SessionStatus, Status } from '@getgrowly/core';
import { truncateAddress } from '@getgrowly/ui';

const AnimatedLoadingSmall = dynamic(
  () =>
    import('@/components/animated-components/animated-loading-small').then(
      module => module.AnimatedLoadingSmall
    ),
  { ssr: false }
);

export function DashboardInner() {
  const { selectedOrganization } = useDashboardState();
  const router = useRouter();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    id: '30d',
    label: 'Last 30 days',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  // Use the new React Query hooks for data fetching
  const {
    isLoading,
    data: { agents, users, workflows, messages: recentMessages, resources },
    refetchAll,
  } = useDashboardDataQueries(selectedOrganization?.id);

  // Check if organization has zero data
  const hasNoData =
    !isLoading &&
    agents.length === 0 &&
    users.length === 0 &&
    workflows.length === 0 &&
    resources.length === 0;

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      // Show loading toast
      toast.info('Refreshing dashboard data...');

      // Trigger refetch of all data
      await refetchAll();
      toast.success('Dashboard data refreshed!');
    } catch (error: unknown) {
      toast.error('Failed to refresh data');
      console.error('Refresh error:', error);
    }
  };

  const handleCreateAgent = async () => {
    router.push('/dashboard/agents');
  };

  const handleAddResource = async () => {
    router.push('/dashboard/resources');
  };

  const handleImportUsers = async () => {
    router.push('/dashboard/users');
  };

  const calculateMetrics = (
    agents: Agent[],
    users: ParsedUser[],
    workflows: AggregatedWorkflow[]
  ) => {
    const activeAgents = agents.filter(agent => agent.status === Status.Active);
    const runningWorkflows = workflows.filter(workflow => workflow.status === Status.Active);

    // Filter users based on selected time range
    const filteredUsers = users.filter(user => {
      const createdAt = moment(user.created_at);
      return createdAt.isBetween(
        selectedTimeRange.startDate,
        selectedTimeRange.endDate,
        'day',
        '[]'
      );
    });

    return {
      newUsers30d: filteredUsers.length,
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      totalWorkflows: workflows.length,
      runningWorkflows: runningWorkflows.length,
      resourceUsage: Math.round((activeAgents.length / (agents.length || 1)) * 100),
    };
  };

  // Calculate metrics based on the fetched data
  const metrics =
    agents && users && workflows
      ? calculateMetrics(agents, users, workflows)
      : {
          newUsers30d: 0,
          totalAgents: 0,
          activeAgents: 0,
          totalWorkflows: 0,
          runningWorkflows: 0,
          resourceUsage: 0,
        };

  // Create recent activity array from the fetched data
  const recentActivity = React.useMemo(() => {
    if (!agents || !users || !workflows) return [];

    // Filter users based on selected time range
    const filteredUsers = users.filter(user => {
      const createdAt = moment(user.created_at);
      return createdAt.isBetween(
        selectedTimeRange.startDate,
        selectedTimeRange.endDate,
        'day',
        '[]'
      );
    });

    return [
      ...filteredUsers.map(user => ({
        type: 'user' as const,
        title: `New user "${truncateAddress(user.entities.walletAddress, 8, 6)}" added`,
        timestamp: user.created_at,
        icon: (
          <AppUserAvatarWithStatus
            size={25}
            walletAddress={user.personaData.id as any}
            name={user.name}
            online={SessionStatus.Offline}
          />
        ),
        color: '',
      })),
      ...agents.map((agent: Agent) => ({
        type: 'agent' as const,
        title: `Agent "${agent.name}" ${agent.status === Status.Active ? 'activated' : 'deactivated'}`,
        timestamp: agent.created_at,
        icon: <Bot className="h-4 w-4 text-blue-600" />,
        color: 'bg-blue-100',
      })),
      ...workflows.map((workflow: AggregatedWorkflow) => ({
        type: 'workflow' as const,
        title: `Workflow "${workflow.name}" ${workflow.status === Status.Active ? 'started' : 'stopped'}`,
        timestamp: workflow.created_at,
        icon: <WorkflowIcon className="h-4 w-4 text-green-600" />,
        color: 'bg-green-100',
      })),
    ].sort((a, b) => moment(b.timestamp).unix() - moment(a.timestamp).unix());
  }, [agents, users, workflows, selectedTimeRange]);

  return (
    <React.Fragment>
      {isLoading ? (
        <AnimatedLoadingSmall />
      ) : hasNoData ? (
        <DashboardEmptyState
          onCreateAgent={handleCreateAgent}
          onAddResource={handleAddResource}
          onImportUsers={handleImportUsers}
        />
      ) : (
        <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{selectedOrganization?.name}</h1>
              <p className="text-muted-foreground text-sm">{selectedOrganization?.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <TimeRangeSelector
                selectedRange={selectedTimeRange}
                onRangeChange={setSelectedTimeRange}
              />
              <Button onClick={handleRefresh} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 grid-cols-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <IconContainer className={'bg-primary w-6 h-6 border-primary text-white'}>
                      <User2Icon className="h-4 w-4" />
                    </IconContainer>{' '}
                    New Users ({selectedTimeRange.label})
                  </div>
                </CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.newUsers30d}</div>
                <p className="text-xs text-muted-foreground">
                  New users in the selected time range
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <IconContainer className={'bg-primary w-6 h-6 border-primary text-white'}>
                      <Bot className="h-4 w-4" />
                    </IconContainer>{' '}
                    Total Agents
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeAgents} active, {metrics.totalAgents - metrics.activeAgents}{' '}
                  inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <IconContainer className={'bg-primary w-6 h-6 border-primary text-white'}>
                      <ActivityIcon className="h-4 w-4" />
                    </IconContainer>{' '}
                    Active Workflows
                  </div>
                </CardTitle>
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
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <IconContainer className={'bg-primary w-6 h-6 border-primary text-white'}>
                      <Settings2 className="h-4 w-4" />
                    </IconContainer>{' '}
                    Resource Usage
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resourceUsage}%</div>
                <p className="text-xs text-muted-foreground">Agent utilization</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <GrowthRetentionChart timeRange={selectedTimeRange} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="col-span-1 h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                    <CardDescription className="text-xs">
                      Latest actions across your organization
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recentActivity.length} {recentActivity.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {recentActivity.map(activity => (
                    <div key={activity.timestamp} className="flex items-center gap-4">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.color
                        }`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-normal">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {moment(activity.timestamp).fromNow()}
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
            <Card className="col-span-2 h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Recent Messages</CardTitle>
                    <CardDescription className="text-xs">
                      Latest messages from users
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/users')}
                    className="text-muted-foreground hover:text-primary">
                    View users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentMessages.map(message => (
                  <div key={message.id} onClick={() => setSelectedMessageId(message.id)}>
                    <MessageListCard
                      message={message}
                      selected={message.id === selectedMessageId}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
