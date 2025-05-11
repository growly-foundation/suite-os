'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { useDashboardState } from '@/hooks/use-dashboard';
import { toast } from 'react-toastify';
import { AgentAction as AgentActionType } from '@growly/core';

interface AgentActionProps {
  onAdd: (data: any) => void;
}

export function AgentAction({ onAdd }: AgentActionProps) {
  const { selectedOrganization } = useDashboardState();
  // const [agentId, setAgentId] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');

  const handleAdd = () => {
    if (!selectedOrganization) {
      toast.error('Please select an organization');
      return;
    }
    onAdd({
      // TODO: Get agent ID from the agent list
      agentId: generateId(),
      organizationId: selectedOrganization.id,
      prompt: agentPrompt,
    } as AgentActionType['args']);
  };

  return (
    <div className="space-y-4 mt-4">
      {/* <div className="space-y-2">
        <Label htmlFor="agentId">Agent ID</Label>
        <Input
          id="agentId"
          value={agentId}
          onChange={e => setAgentId(e.target.value)}
          placeholder="Enter agent ID"
        />
      </div> */}
      <div className="space-y-2">
        <Label htmlFor="agentPrompt">Agent Prompt</Label>
        <Textarea
          id="agentPrompt"
          value={agentPrompt}
          onChange={e => setAgentPrompt(e.target.value)}
          placeholder="Enter the prompt for the agent"
          rows={3}
        />
      </div>
      <Button type="button" onClick={handleAdd} disabled={!agentPrompt}>
        <Plus className="mr-2 h-4 w-4" />
        Add Agent Action
      </Button>
    </div>
  );
}
