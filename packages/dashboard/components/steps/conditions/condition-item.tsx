'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { ConditionType, Step, StepId, UIEventCondition } from '@growly/core';

interface ConditionItemProps {
  condition: any;
  onRemove: (id: StepId) => void;
  existingSteps: Step[];
  disableRemove?: boolean;
}

export function ConditionItem({
  condition,
  onRemove,
  existingSteps,
  disableRemove = false,
}: ConditionItemProps) {
  const getConditionLabel = (condition: any) => {
    switch (condition.type) {
      case ConditionType.Always:
        return 'Always';
      case ConditionType.Step:
        const step = existingSteps.find(s => s.id === condition.data);
        return step ? `After step: ${step.name}` : `After step: ${condition.data}`;
      case ConditionType.Workflow:
        return `After workflow: ${condition.data}`;
      case ConditionType.UIEvent:
        return `UI Event: ${getUIEventLabel(condition.data)}`;
      case ConditionType.JudgedByAgent:
        return 'Judged by Agent';
      default:
        return 'Unknown condition';
    }
  };

  const getUIEventLabel = (eventType: UIEventCondition) => {
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
      <span className="text-sm">{getConditionLabel(condition)}</span>
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
