'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface ActionItemProps {
  action: any;
  onRemove: (id: string) => void;
  disableRemove?: boolean;
}

export function ActionItem({ action, onRemove, disableRemove = false }: ActionItemProps) {
  const getActionLabel = (action: any) => {
    if (action.type === 'text') {
      return `Text: ${action.data.text.substring(0, 20)}${action.data.text.length > 20 ? '...' : ''}`;
    } else {
      return `Agent: ${action.data.agentId} - ${action.data.prompt.substring(0, 20)}${
        action.data.prompt.length > 20 ? '...' : ''
      }`;
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
