import { PaddingLayout } from '@/app/dashboard/layout';

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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-5">
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
    </PaddingLayout>
  );
}
