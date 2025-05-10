'use client';

import { useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Bot, Edit, FileText, MoreHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditStepDialog } from '@/components/steps/edit-step-dialog';
import { getConditionDescription } from '@/lib/workflow.utils';
import type { ParsedStep } from '@growly/core';

export function StepNode({ data }: NodeProps) {
  const { step } = data as { step: ParsedStep };
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Determine the icon based on the action type
  const getActionIcon = (action: any) => {
    if (!action) return <FileText className="h-4 w-4" />;

    if (typeof action === 'object' && 'type' in action) {
      switch (action.type) {
        case 'agent':
          return <Bot className="h-4 w-4" />;
        case 'text':
          return <FileText className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    }

    return <FileText className="h-4 w-4" />;
  };

  // Get condition description
  const getConditionDescriptions = () => {
    if (!step.conditions) return ['No conditions'];

    if (typeof step.conditions === 'boolean' || typeof step.conditions === 'string') {
      return [getConditionDescription(step.conditions)];
    }

    if (typeof step.conditions === 'object') {
      if (step.conditions.type === 'judgedByAgent') {
        return ['Judged by Agent'];
      }

      if (step.conditions.type === 'and' || step.conditions.type === 'or') {
        const operator = step.conditions.type === 'and' ? 'AND' : 'OR';
        const conditions = step.conditions.conditions || [];

        if (conditions.length === 0) return ['No conditions'];

        if (conditions.length === 1) {
          return [getConditionDescription(conditions[0])];
        }

        return [`${conditions.length} conditions (${operator})`];
      }
    }

    return ['Custom condition'];
  };

  // Get action descriptions
  const getActionDescriptions = () => {
    if (!step.action) return ['No actions'];

    if (!Array.isArray(step.action)) {
      return ['1 action'];
    }

    if (step.action.length === 0) return ['No actions'];

    return step.action.map((action, index) => {
      if (action.type === 'text') {
        const text = action.return?.text || '';
        return `Text: ${text.substring(0, 15)}${text.length > 15 ? '...' : ''}`;
      } else if (action.type === 'agent') {
        return `Agent: ${action.args?.agentId || 'Unknown'}`;
      }
      return `Action ${index + 1}`;
    });
  };

  const conditionDescriptions = getConditionDescriptions();
  const actionDescriptions = getActionDescriptions();

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Card className="w-[280px] shadow-md">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {Array.isArray(step.action) && step.action.length > 0 ? (
              getActionIcon(step.action[0])
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {step.name}
          </CardTitle>
          <Badge variant={step.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {step.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2 text-xs">
          <p className="text-muted-foreground line-clamp-2">
            {step.description || 'No description provided'}
          </p>

          <div className="mt-3 space-y-2">
            <div>
              <span className="font-medium">Conditions:</span>
              <div className="mt-1 space-y-1">
                {conditionDescriptions.map((desc, i) => (
                  <Badge key={i} variant="outline" className="mr-1 text-xs">
                    {desc}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium">Actions:</span>
              <div className="mt-1 space-y-1">
                {actionDescriptions.map((desc, i) => (
                  <Badge key={i} variant="outline" className="mr-1 text-xs">
                    {desc}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-2 flex justify-end border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      <Handle type="source" position={Position.Right} />

      <EditStepDialog open={isEditOpen} onOpenChange={setIsEditOpen} step={step} />
    </>
  );
}
