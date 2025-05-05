'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export function WorkflowCard({ workflow, isSelected, onClick }: WorkflowCardProps) {
  const formattedDate = new Date(workflow.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md',
        isSelected ? 'ring-2 ring-coinbase-blue ring-offset-2' : ''
      )}
      onClick={onClick}>
      <CardContent className="p-0">
        <div
          className={cn(
            'p-4 border-b',
            workflow.status === 'active' ? 'bg-coinbase-blue/10' : 'bg-muted/50'
          )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow
                className={cn(
                  'h-5 w-5',
                  workflow.status === 'active' ? 'text-coinbase-blue' : 'text-muted-foreground'
                )}
              />
              <h3 className="font-semibold truncate">{workflow.name}</h3>
            </div>
            <Badge
              variant={workflow.status === 'active' ? 'default' : 'outline'}
              className={cn(
                'capitalize',
                workflow.status === 'active' && 'bg-coinbase-green text-white'
              )}>
              {workflow.status}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">{workflow.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-muted/30 text-xs text-muted-foreground">
        <span>Created {formattedDate}</span>
        <ChevronRight className="h-4 w-4" />
      </CardFooter>
    </Card>
  );
}
