'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { ConditionType, UIEventCondition } from '@growly/core';

interface ConditionItemProps {
  condition: any;
  onRemove: (id: string) => void;
  existingSteps: any[];
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
        return 'On Page Load';
      case UIEventCondition.OnVisited:
        return 'On Visited';
      case UIEventCondition.OnClicked:
        return 'On Clicked';
      case UIEventCondition.OnHovered:
        return 'On Hovered';
      default:
        return eventType;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
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
