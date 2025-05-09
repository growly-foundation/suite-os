'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AgentsList } from '@/components/agents/agent-list';

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Agents</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your organization&apos;s AI agents
          </p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Agent
          </Button>
        </Link>
      </div>
      <AgentsList />
    </div>
  );
}
