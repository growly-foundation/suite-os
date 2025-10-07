import { PaddingLayout } from '@/app/dashboard/layout';
import { availableModels } from '@/constants/agents';
import { countBytes, formatBytes } from '@/lib/utils';
import { useState } from 'react';

import {
  AggregatedAgent,
  ContractValue,
  DocumentValue,
  LinkValue,
  ResourceType,
  TextValue,
  TypedResource,
} from '@getgrowly/core';

import { ResourceIcon } from '../resources/resource-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AgentForm } from './agent-form';

const MAX_BYTES_SIZE = 200 * 1024;
const CONTRACT_EXTRA_SIZE_COST = 10 * 1024;
const LINK_EXTRA_SIZE_COST = 50 * 1024;

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
  const calculateResourceSize = (resource: TypedResource<ResourceType>) => {
    switch (resource.type) {
      case 'contract':
        const value = resource.value as ContractValue;
        return countBytes(
          value.abi +
            value.address +
            (value.abi || CONTRACT_EXTRA_SIZE_COST) +
            CONTRACT_EXTRA_SIZE_COST
        );
      case 'link':
        const linkValue = resource.value as LinkValue;
        return countBytes(linkValue.url + (linkValue.description || '') + LINK_EXTRA_SIZE_COST);
      case 'document':
        const documentValue = resource.value as DocumentValue;
        return countBytes(documentValue.documentUrl);
      case 'text':
        const textValue = resource.value as TextValue;
        return countBytes(textValue.content);
    }
  };

  const totalSize =
    descriptionSize +
    formData.resources.reduce((acc, resource) => acc + calculateResourceSize(resource), 0);

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
              Total size: {formatBytes(totalSize)} / {formatBytes(MAX_BYTES_SIZE)} (
              {((totalSize / MAX_BYTES_SIZE) * 100).toFixed(2)} %)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-2 text-sm">
              <p>Description</p>
              <p>{formatBytes(descriptionSize)}</p>
            </div>
            {formData.resources.map((resource, index) => (
              <div key={index} className="flex justify-between items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <ResourceIcon type={resource.type} /> {resource.name}
                </div>
                <p>{formatBytes(calculateResourceSize(resource))}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PaddingLayout>
  );
}
