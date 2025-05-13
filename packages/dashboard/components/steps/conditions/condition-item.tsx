'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Condition, ConditionType, ParsedStep, StepId, UIEventCondition } from '@growly/core';
import { ConditionTreeView } from './condition-tree-view';

interface ConditionItemProps {
  condition: Condition;
  onRemove: (id: StepId) => void;
  existingSteps: ParsedStep[];
  disableRemove?: boolean;
}

export type ConditionItemNode = {
  title: string;
  desc?: string;
  status: 'success' | 'error' | 'pending';
  children?: ConditionItemNode[];
};

export function ConditionItem({
  condition,
  onRemove,
  existingSteps,
  disableRemove = false,
}: ConditionItemProps) {
  const getConditionLabel = (condition: Condition): ConditionItemNode[] => {
    switch (condition.type) {
      case ConditionType.Always:
        return [{ title: 'Always', desc: 'Step is always executed', status: 'success' }];
      case ConditionType.Step:
        const step = existingSteps.find(s => s.id === condition.data);
        return step
          ? [
              {
                title: 'After step',
                desc: `Step ${step.name} must be completed`,
                status: 'success',
              },
            ]
          : [
              {
                title: 'After step',
                desc: `No step with id ${condition.data}`,
                status: 'error',
              },
            ];
      case ConditionType.Workflow:
        return [
          {
            title: 'After workflow',
            desc: `Workflow ${condition.data} must be completed`,
            status: 'pending',
          },
        ];
      case ConditionType.UIEvent:
        return [{ title: 'UI Event', desc: getUIEventLabel(condition.data), status: 'pending' }];
      case ConditionType.JudgedByAgent:
        return [{ title: 'Judged by Agent', desc: 'Agent must judge the step', status: 'pending' }];
      case ConditionType.Or:
        return [
          {
            title: 'Or',
            desc: 'Any of the following conditions are true',
            children: condition.data.map(getConditionLabel).flat(),
            status: 'pending',
          },
        ];
      case ConditionType.And:
        return [
          {
            title: 'And',
            desc: 'All of the following conditions are true',
            children: condition.data.map(getConditionLabel).flat(),
            status: 'pending',
          },
        ];
      default:
        return [{ title: 'Unknown condition', status: 'error' }];
    }
  };

  const getUIEventLabel = (eventType: UIEventCondition): string => {
    switch (eventType) {
      case UIEventCondition.OnPageLoad:
        return 'When the page is loaded';
      case UIEventCondition.OnVisited:
        return 'When a specified element is visited';
      case UIEventCondition.OnClicked:
        return 'When a specified element is clicked';
      case UIEventCondition.OnHovered:
        return 'When a specified element is hovered';
      default:
        return eventType;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 px-4 border rounded-md">
      <ConditionTreeView nodes={getConditionLabel(condition)} />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(condition.id)}
        disabled={disableRemove}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
