'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface AgentActionProps {
  onAdd: (data: any) => void;
}

export function AgentAction({ onAdd }: AgentActionProps) {
  const [agentId, setAgentId] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');

  const handleAdd = () => {
    onAdd({
      agentId,
      organizationId: 'org-1', // Default organization ID
      model: 'gpt-4o', // Default model
      prompt: agentPrompt,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="agentId">Agent ID</Label>
        <Input
          id="agentId"
          value={agentId}
          onChange={e => setAgentId(e.target.value)}
          placeholder="Enter agent ID"
        />
      </div>
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
      <Button type="button" onClick={handleAdd} disabled={!agentId || !agentPrompt}>
        <Plus className="mr-2 h-4 w-4" />
        Add Agent Action
      </Button>
    </div>
  );
}
