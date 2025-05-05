import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepListProps {
  steps: {
    id: string;
    name: string;
    description: string;
    status: string;
  }[];
}

export function StepList({ steps }: StepListProps) {
  if (steps.length === 0) {
    return (
      <Card className="rounded-xl border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No steps added to this workflow yet.</p>
          <p className="text-sm mt-1">Add your first step to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={step.id} className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-start p-4 gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-white font-medium text-sm',
                    'bg-coinbase-blue'
                  )}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-coinbase-blue/20 my-1"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{step.name}</h4>
                  <Badge
                    variant={step.status === 'active' ? 'default' : 'outline'}
                    className={cn(
                      'capitalize',
                      step.status === 'active' && 'bg-coinbase-green text-white'
                    )}>
                    {step.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
