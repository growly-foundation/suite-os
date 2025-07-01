import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { agentModelMap } from '@/constants/agents';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { truncateString } from '@/lib/utils';
import { Cpu, Loader, MoreHorizontal, Power, User2 } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Agent, AggregatedAgent, ParsedUser, Status } from '@getgrowly/core';

import { Loadable } from '../ui/loadable';
import { Skeleton } from '../ui/skeleton';
import { AgentModelCard } from './agent-model-card';

export const AgentCard = ({ agent }: { agent: Agent }) => {
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDuplicate, setLoadingDuplicate] = useState(false);
  const [agentDetails, setAgentDetails] = useState<AggregatedAgent | null>(null);
  const [agentUsers, setAgentUsers] = useState<ParsedUser[]>([]);

  const { selectedOrganization, fetchOrganizationAgents, fetchOrganizationAgentById } =
    useDashboardState();

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const agentDetails = await suiteCore.agents.getAggregatedAgent(agent.id);
        setAgentDetails(agentDetails);
        const agentUsers = await suiteCore.users.getUsersByAgentId(agent.id);
        setAgentUsers(agentUsers);
      } catch (error) {
        console.error('Failed to fetch agent details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentDetails();
  }, [agent.id]);

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      await suiteCore.db.agents.delete(agent.id);
      toast.success('Agent deleted successfully');
      await fetchOrganizationAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      if (!selectedOrganization) throw new Error('Organization not found');
      setLoadingDuplicate(true);
      const agentWithWorkflows = await fetchOrganizationAgentById(agent.id);
      if (!agentWithWorkflows) throw new Error('Agent not found');
      await suiteCore.agents.createOrUpdate(selectedOrganization.id, agentWithWorkflows, true);
      toast.success('Agent duplicated successfully');
      await fetchOrganizationAgents();
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
      toast.error('Failed to duplicate agent');
    } finally {
      setLoadingDuplicate(false);
    }
  };

  return (
    <Link href={`/dashboard/agents/${agent.id}`} className="w-full">
      <Card key={agent.id} className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-6 pt-3">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold h-[40px] flex items-center overflow-hidden">
                  {agent.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {agent.created_at ? moment(agent.created_at).fromNow() : ''}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href={`/dashboard/agents/${agent.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={loadingDuplicate}>
                  {loadingDuplicate ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Duplicate'
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={loadingDelete}>
                  {loadingDelete ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-[50px]">
            {truncateString(agent.description || '', 100) || 'No description provided'}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                icon: <Power className="h-4 w-4 mb-1 text-muted-foreground" />,
                label: agent.status === Status.Active ? 'Active' : 'Inactive',
                loading: false,
              },
              {
                icon: <User2 className="h-4 w-4 mb-1 text-muted-foreground" />,
                label: `${agentUsers.length} users`,
                loading: loading,
              },
              {
                icon: <Cpu className="h-4 w-4 mb-1 text-muted-foreground" />,
                label: `${agentDetails?.resources.length} resources`,
                loading: loading,
              },
            ].map((item, index) => (
              <Loadable
                loading={loading || !agentDetails}
                fallback={<Skeleton className="h-6 w-24" />}>
                <div
                  key={index}
                  className="flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Loadable>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {agentModelMap[agent.model] && (
              <AgentModelCard model={agentModelMap[agent.model]} iconOnly />
            )}
            <Loadable
              loading={loading || !agentDetails}
              fallback={<Skeleton className="h-6 w-24" />}>
              <Badge variant="outline" className="px-2 py-0 text-xs">
                {agentDetails?.workflows.length} workflows
              </Badge>
            </Loadable>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
