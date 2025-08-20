'use client';

import { AgentsList } from '@/components/agents/agent-list';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useDashboardDataQueries } from '@/hooks/use-dashboard-queries';
import { PlusCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';

import { PaddingLayout } from '../layout';

const AnimatedLoadingSmall = dynamic(
  () =>
    import('@/components/animated-components/animated-loading-small').then(
      module => module.AnimatedLoadingSmall
    ),
  { ssr: false }
);

export default function AgentsPage() {
  const { selectedOrganization } = useDashboardState();

  const {
    isLoading,
    data: { agents, resources },
  } = useDashboardDataQueries(selectedOrganization?.id);

  return (
    <React.Fragment>
      <div className="flex items-center border-b border-b-slate-200 px-4 py-2 justify-between">
        <p className="text-sm text-muted-foreground">
          View and manage your organization&apos;s AI agents
        </p>
        <Link href="/dashboard/agents/new">
          <PrimaryButton>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Agent
          </PrimaryButton>
        </Link>
      </div>
      <PaddingLayout>
        <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
          {isLoading ? (
            <AnimatedLoadingSmall />
          ) : (
            <AgentsList agents={agents} resourceCount={resources.length} />
          )}
        </div>
      </PaddingLayout>
    </React.Fragment>
  );
}
