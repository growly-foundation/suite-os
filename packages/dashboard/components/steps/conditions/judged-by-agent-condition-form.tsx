'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface JudgedByAgentConditionProps {
  onAdd: (data: any) => void;
  existingSteps: any[];
}

export function JudgedByAgentCondition({ onAdd, existingSteps }: JudgedByAgentConditionProps) {
  const [judgeAgentId, setJudgeAgentId] = useState('');
  const [judgeStepId, setJudgeStepId] = useState('');
  const [judgePrompt, setJudgePrompt] = useState('');

  const handleAdd = () => {
    onAdd({
      type: 'judgedByAgent',
      args: {
        stepId: judgeStepId,
        agentId: judgeAgentId,
        prompt: judgePrompt,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="judgeAgentId">Agent ID</Label>
        <Input
          id="judgeAgentId"
          value={judgeAgentId}
          onChange={e => setJudgeAgentId(e.target.value)}
          placeholder="Enter agent ID"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="judgeStepId">Step ID to Judge</Label>
        <Select value={judgeStepId} onValueChange={setJudgeStepId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a step" />
          </SelectTrigger>
          <SelectContent>
            {existingSteps.map(step => (
              <SelectItem key={step.id} value={step.id}>
                {step.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="judgePrompt">Judge Prompt</Label>
        <Textarea
          id="judgePrompt"
          value={judgePrompt}
          onChange={e => setJudgePrompt(e.target.value)}
          placeholder="Enter the prompt for the agent to judge"
          rows={2}
        />
      </div>
      <Button
        type="button"
        onClick={handleAdd}
        disabled={!judgeAgentId || !judgeStepId || !judgePrompt}>
        <Plus className="mr-2 h-4 w-4" />
        Add Agent Judgment Condition
      </Button>
    </div>
  );
}
