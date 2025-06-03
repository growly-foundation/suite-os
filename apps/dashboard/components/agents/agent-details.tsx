import { PaddingLayout } from '@/app/dashboard/layout';
import { countBytesFormatted } from '@/lib/utils';

import { AggregatedAgent } from '@getgrowly/core';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AgentForm } from './agent-form';

export function AgentDetails({
  agent,
  onSave,
}: {
  agent: AggregatedAgent;
  onSave: (agent: AggregatedAgent) => Promise<void>;
}) {
  return (
    <PaddingLayout>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <div className="flex justify-between items-center gap-5">
              <div>
                <CardTitle className="text-xl">Agent Details</CardTitle>
                <CardDescription className="mt-2">
                  Manage your agent's basic information and settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AgentForm agent={agent} onSave={onSave} />
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Knowledge Sources</CardTitle>
            <CardDescription>
              Total size: {countBytesFormatted(agent.description || '')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center gap-2 text-sm">
              <p>Description</p>
              <p>{countBytesFormatted(agent.description || '')}</p>
            </div>
            {agent.resources.map((resource, index) => (
              <div key={index}>
                <p>{resource.name}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PaddingLayout>
  );
}
