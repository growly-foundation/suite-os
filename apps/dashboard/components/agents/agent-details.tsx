import { PaddingLayout } from '@/app/dashboard/layout';
import { availableModels } from '@/constants/agents';
import { countBytes, formatBytes } from '@/lib/utils';
import { useState } from 'react';

import { AggregatedAgent } from '@getgrowly/core';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AgentForm } from './agent-form';

const MAX_BYTES_SIZE = 200 * 1024;

export function AgentDetails({
  agent,
  onSave,
}: {
  agent: AggregatedAgent;
  onSave: (agent: AggregatedAgent) => Promise<void>;
}) {
  const [formData, setFormData] = useState<AggregatedAgent>({
    ...agent,
    model: agent.model || availableModels[0].id,
  });
  const descriptionSize = countBytes(formData.description || '');
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
            <AgentForm formData={formData} setFormData={setFormData} onSave={onSave} />
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Knowledge Sources</CardTitle>
            <CardDescription>
              Total size: {formatBytes(descriptionSize)} / {formatBytes(MAX_BYTES_SIZE)} (
              {((descriptionSize / MAX_BYTES_SIZE) * 100).toFixed(2)} %)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center gap-2 text-sm">
              <p>Description</p>
              <p>{formatBytes(descriptionSize)}</p>
            </div>
            {formData.resources.map((resource, index) => (
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
