'use client';

import { Button } from '@/components/ui/button';
import { Action } from '@growly/core';
import { Trash } from 'lucide-react';

interface ActionItemProps {
  action: Action;
  onRemove: (id: string) => void;
  disableRemove?: boolean;
}

export function ActionItem({ action, onRemove, disableRemove = false }: ActionItemProps) {
  const getActionLabel = (action: Action) => {
    if (action.type === 'text') {
      return `Text: ${action.return?.text.substring(0, 20)}${action.return?.text.length > 20 ? '...' : ''}`;
    } else {
      return `Agent: ${action.args?.prompt.substring(0, 20)}${action.args?.prompt.length > 20 ? '...' : ''}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
      <span className="text-sm">{getActionLabel(action)}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(action.id)}
        disabled={disableRemove}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
