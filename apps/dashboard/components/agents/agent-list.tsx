'use client';

import { Agent } from '@getgrowly/core';

import { AgentCard } from './agent-card';
import { AgentsEmptyState } from './agents-empty-state';

export function AgentsList({
  agents,
  resourceCount = 0,
}: {
  agents: Agent[];
  resourceCount?: number;
}) {
  if (agents.length === 0) {
    return <AgentsEmptyState resourceCount={resourceCount} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      {agents.map(agent => {
        return <AgentCard key={agent.id} agent={agent} />;
      })}
    </div>
  );
}
