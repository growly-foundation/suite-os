'use client';

import { useEffect, useState } from 'react';
import { Bot, FileText, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Action, Condition, ParsedStep, UIEventCondition } from '@growly/core';
import { mockWorkflows } from '@/lib/data/mock';
import { generateId } from '@/lib/utils';

interface EditStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: ParsedStep;
}

type ConditionItem = {
  id: string;
  type: 'always' | 'step' | 'workflow' | 'uievent' | 'agent';
  data: any;
};

type ActionItem = {
  id: string;
  type: 'text' | 'agent';
  data: any;
};

export function EditStepDialog({ open, onOpenChange, step }: EditStepDialogProps) {
  const [name, setName] = useState(step.name);
  const [description, setDescription] = useState(step.description || '');
  const [status, setStatus] = useState(step.status);

  // Lists of conditions and actions
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);

  // Current editing state
  const [currentConditionType, setCurrentConditionType] = useState<
    'always' | 'step' | 'workflow' | 'uievent' | 'agent'
  >('always');
  const [currentActionType, setCurrentActionType] = useState<'text' | 'agent'>('text');

  // Condition form states
  const [dependsOn, setDependsOn] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState('');
  const [uiEvent, setUiEvent] = useState<UIEventCondition>(UIEventCondition.Always);
  const [judgeAgentId, setJudgeAgentId] = useState('');
  const [judgeStepId, setJudgeStepId] = useState('');
  const [judgePrompt, setJudgePrompt] = useState('');

  // Action form states
  const [textAction, setTextAction] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');

  // Get all steps except the current one
  const allSteps = mockWorkflows.flatMap(w => w.steps || []).filter(s => s.id !== step.id);

  // Parse step data on load
  useEffect(() => {
    if (!step) return;

    setName(step.name);
    setDescription(step.description || '');
    setStatus(step.status);

    // Parse conditions
    const parsedConditions: ConditionItem[] = [];

    if (step.conditions === true) {
      parsedConditions.push({ id: generateId(), type: 'always', data: true });
    } else if (typeof step.conditions === 'string') {
      // Check if it's a UI event or a step ID
      if (Object.values(UIEventCondition).includes(step.conditions as UIEventCondition)) {
        parsedConditions.push({ id: generateId(), type: 'uievent', data: step.conditions });
      } else {
        parsedConditions.push({ id: generateId(), type: 'step', data: step.conditions });
      }
    } else if (typeof step.conditions === 'object') {
      if (step.conditions.type === 'judgedByAgent') {
        parsedConditions.push({
          id: generateId(),
          type: 'agent',
          data: step.conditions,
        });
      } else if (step.conditions.type === 'and' || step.conditions.type === 'or') {
        // Handle multiple conditions
        step.conditions.conditions.forEach((condition: any) => {
          if (condition === true) {
            parsedConditions.push({ id: generateId(), type: 'always', data: true });
          } else if (typeof condition === 'string') {
            // Check if it's a UI event or a step/workflow ID
            if (Object.values(UIEventCondition).includes(condition as UIEventCondition)) {
              parsedConditions.push({ id: generateId(), type: 'uievent', data: condition });
            } else {
              // Assume it's a step ID for simplicity
              parsedConditions.push({ id: generateId(), type: 'step', data: condition });
            }
          } else if (typeof condition === 'object' && condition.type === 'judgedByAgent') {
            parsedConditions.push({ id: generateId(), type: 'agent', data: condition });
          }
        });
      }
    }

    // If no conditions were parsed, add a default "always" condition
    if (parsedConditions.length === 0) {
      parsedConditions.push({ id: generateId(), type: 'always', data: true });
    }

    setConditions(parsedConditions);

    // Parse actions
    const parsedActions: ActionItem[] = [];

    if (Array.isArray(step.action)) {
      step.action.forEach((action: any) => {
        if (action.type === 'text') {
          parsedActions.push({
            id: generateId(),
            type: 'text',
            data: { text: action.return?.text || '' },
          });
        } else if (action.type === 'agent') {
          parsedActions.push({
            id: generateId(),
            type: 'agent',
            data: {
              agentId: action.args?.agentId || '',
              organizationId: action.args?.organizationId || 'org-1',
              model: action.args?.model || 'gpt-4o',
              prompt: action.args?.prompt || '',
            },
          });
        }
      });
    }

    // If no actions were parsed, add a default text action
    if (parsedActions.length === 0) {
      parsedActions.push({ id: generateId(), type: 'text', data: { text: '' } });
    }

    setActions(parsedActions);
  }, [step]);

  const addCondition = () => {
    let conditionData: any;

    switch (currentConditionType) {
      case 'always':
        conditionData = true;
        break;
      case 'step':
        conditionData = dependsOn;
        break;
      case 'workflow':
        conditionData = workflowId;
        break;
      case 'uievent':
        conditionData = uiEvent;
        break;
      case 'agent':
        conditionData = {
          type: 'judgedByAgent',
          args: {
            stepId: judgeStepId,
            agentId: judgeAgentId,
            prompt: judgePrompt,
          },
        };
        break;
    }

    setConditions([
      ...conditions,
      {
        id: generateId(),
        type: currentConditionType,
        data: conditionData,
      },
    ]);

    // Reset form fields
    setDependsOn(null);
    setWorkflowId('');
    setJudgeAgentId('');
    setJudgeStepId('');
    setJudgePrompt('');
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const addAction = () => {
    let actionData: any;

    if (currentActionType === 'text') {
      actionData = { text: textAction };
    } else {
      actionData = {
        agentId,
        organizationId: 'org-1',
        model: 'gpt-4o',
        prompt: agentPrompt,
      };
    }

    setActions([
      ...actions,
      {
        id: generateId(),
        type: currentActionType,
        data: actionData,
      },
    ]);

    // Reset form fields
    setTextAction('');
    setAgentId('');
    setAgentPrompt('');
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const getConditionLabel = (condition: ConditionItem) => {
    switch (condition.type) {
      case 'always':
        return 'Always';
      case 'step':
        const step = allSteps.find(s => s.id === condition.data);
        return step ? `After step: ${step.name}` : `After step: ${condition.data}`;
      case 'workflow':
        return `After workflow: ${condition.data}`;
      case 'uievent':
        return `UI Event: ${condition.data}`;
      case 'agent':
        return 'Judged by Agent';
      default:
        return 'Unknown condition';
    }
  };

  const getActionLabel = (action: ActionItem) => {
    if (action.type === 'text') {
      return `Text: ${action.data.text.substring(0, 20)}${action.data.text.length > 20 ? '...' : ''}`;
    } else {
      return `Agent: ${action.data.agentId} - ${action.data.prompt.substring(0, 20)}${action.data.prompt.length > 20 ? '...' : ''}`;
    }
  };

  const handleSave = () => {
    // Convert condition items to the format expected by the API
    const conditionsList: Condition[] = conditions.map(c => c.data);

    // Convert action items to the format expected by the API
    const actionsList: Action[] = actions.map(a => {
      if (a.type === 'text') {
        return {
          type: 'text',
          return: {
            text: a.data.text,
          },
        };
      } else {
        return {
          type: 'agent',
          args: {
            agentId: a.data.agentId,
            organizationId: a.data.organizationId,
            model: a.data.model,
            prompt: a.data.prompt,
          },
          return: { type: 'text', return: { text: '' } },
        };
      }
    });

    // In a real app, you would update the step in your API
    console.log('Saving step:', {
      ...step,
      name,
      description,
      status,
      conditions:
        conditions.length === 1
          ? conditions[0].data
          : {
              type: 'and',
              conditions: conditionsList,
            },
      action: actionsList,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Step</DialogTitle>
          <DialogDescription>
            Update the details and configuration of this workflow step.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Step Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="block mb-2">
                Status
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={status === 'active'}
                  onCheckedChange={checked => setStatus(checked ? 'active' : 'inactive')}
                />
                <Label htmlFor="status">{status === 'active' ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Conditions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Conditions</Label>
              <Badge variant="outline" className="font-normal">
                {conditions.length} {conditions.length === 1 ? 'condition' : 'conditions'}
              </Badge>
            </div>

            {conditions.length > 0 && (
              <div className="space-y-2">
                {conditions.map(condition => (
                  <div
                    key={condition.id}
                    className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm">{getConditionLabel(condition)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(condition.id)}
                      disabled={conditions.length === 1}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Add Condition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conditionType">Condition Type</Label>
                  <Select
                    value={currentConditionType}
                    onValueChange={(value: any) => setCurrentConditionType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always (True)</SelectItem>
                      <SelectItem value="step">Depends on Step</SelectItem>
                      <SelectItem value="workflow">Depends on Workflow</SelectItem>
                      <SelectItem value="uievent">UI Event</SelectItem>
                      <SelectItem value="agent">Judged by Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition specific fields */}
                {currentConditionType === 'step' && allSteps.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="dependsOn">Depends On Step</Label>
                    <Select value={dependsOn || ''} onValueChange={setDependsOn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a step" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSteps.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentConditionType === 'workflow' && (
                  <div className="space-y-2">
                    <Label htmlFor="workflowId">Workflow ID</Label>
                    <Input
                      id="workflowId"
                      value={workflowId}
                      onChange={e => setWorkflowId(e.target.value)}
                      placeholder="Enter workflow ID"
                    />
                  </div>
                )}

                {currentConditionType === 'uievent' && (
                  <div className="space-y-2">
                    <Label>UI Event Type</Label>
                    <RadioGroup value={uiEvent} onValueChange={(value: any) => setUiEvent(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UIEventCondition.Always} id="edit-always" />
                        <Label htmlFor="edit-always">Always</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UIEventCondition.OnPageLoad} id="edit-onPageLoad" />
                        <Label htmlFor="edit-onPageLoad">On Page Load</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UIEventCondition.OnVisited} id="edit-onVisited" />
                        <Label htmlFor="edit-onVisited">On Visited</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UIEventCondition.OnClicked} id="edit-onClicked" />
                        <Label htmlFor="edit-onClicked">On Clicked</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UIEventCondition.OnHovered} id="edit-onHovered" />
                        <Label htmlFor="edit-onHovered">On Hovered</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {currentConditionType === 'agent' && (
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
                          {allSteps.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
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
                  </div>
                )}

                <Button
                  type="button"
                  onClick={addCondition}
                  disabled={
                    (currentConditionType === 'step' && !dependsOn) ||
                    (currentConditionType === 'workflow' && !workflowId) ||
                    (currentConditionType === 'agent' &&
                      (!judgeAgentId || !judgeStepId || !judgePrompt))
                  }>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Condition
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Actions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Actions</Label>
              <Badge variant="outline" className="font-normal">
                {actions.length} {actions.length === 1 ? 'action' : 'actions'}
              </Badge>
            </div>

            {actions.length > 0 && (
              <div className="space-y-2">
                {actions.map(action => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm">{getActionLabel(action)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction(action.id)}
                      disabled={actions.length === 1}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Add Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs
                  defaultValue="text"
                  value={currentActionType}
                  onValueChange={v => setCurrentActionType(v as 'text' | 'agent')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Agent
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="textAction">Text Content</Label>
                      <Textarea
                        id="textAction"
                        value={textAction}
                        onChange={e => setTextAction(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="agent" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentId">Agent ID</Label>
                      <Input
                        id="agentId"
                        value={agentId}
                        onChange={e => setAgentId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentPrompt">Agent Prompt</Label>
                      <Textarea
                        id="agentPrompt"
                        value={agentPrompt}
                        onChange={e => setAgentPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="button"
                  onClick={addAction}
                  disabled={
                    (currentActionType === 'text' && !textAction) ||
                    (currentActionType === 'agent' && (!agentId || !agentPrompt))
                  }>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Action
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || conditions.length === 0 || actions.length === 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
