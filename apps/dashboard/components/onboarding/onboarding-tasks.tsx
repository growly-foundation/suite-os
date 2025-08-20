import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Bot,
  CheckCircle,
  Circle,
  ExternalLink,
  FileStack,
  Globe,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action?: () => void;
  isExternal?: boolean;
}

interface OnboardingTasksProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasAgents: boolean;
  hasResources: boolean;
  hasUsers: boolean;
}

export function OnboardingTasks({
  open,
  onOpenChange,
  hasAgents,
  hasResources,
  hasUsers,
}: OnboardingTasksProps) {
  const router = useRouter();

  const tasks: OnboardingTask[] = [
    {
      id: 'create-agent',
      title: 'Create new agent',
      description: 'Set up your first AI agent to start helping your users',
      icon: Bot,
      completed: hasAgents,
      action: () => {
        onOpenChange(false);
        router.push('/dashboard/agents');
      },
    },
    {
      id: 'upload-resource',
      title: 'Upload a new resource',
      description: 'Add documents, links, or contracts for your agents to use',
      icon: FileStack,
      completed: hasResources,
      action: () => {
        onOpenChange(false);
        router.push('/dashboard/resources');
      },
    },
    {
      id: 'import-users',
      title: 'Import users',
      description: 'Manage onchain users by importing them from smart contract or Persona',
      icon: Users,
      completed: hasUsers,
      action: () => router.push('/dashboard/users'),
    },
    {
      id: 'install-widget',
      title: 'Install a widget and restyle with your branding',
      description: 'Learn how to integrate Suite into your application',
      icon: Globe,
      completed: false, // Always show as incomplete since it's external
      isExternal: true,
      action: () => {
        window.open(
          'https://intercom.help/growly-suite/en/articles/11975841-suite-installation-guide-for-browser-widget',
          '_blank'
        );
      },
    },
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length - 1; // Exclude external task from completion count
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
            Getting Started
          </DialogTitle>
          <DialogDescription className="text-sm">
            Complete these tasks to set up your Suite workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {completedTasks}/{totalTasks} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors text-sm',
                  task.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer',
                  task.action && !task.completed && 'hover:border-gray-300'
                )}
                onClick={task.action && !task.completed ? task.action : undefined}>
                <div className="flex-shrink-0 mt-0.5">
                  {task.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <task.icon
                      className={cn('h-4 w-4', task.completed ? 'text-green-600' : 'text-gray-500')}
                    />
                    <h3
                      className={cn(
                        'font-medium text-sm',
                        task.completed ? 'text-green-900' : 'text-gray-900'
                      )}>
                      {task.title}
                    </h3>
                    {task.isExternal && <ExternalLink className="h-3 w-3 text-gray-400" />}
                  </div>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      task.completed ? 'text-green-700' : 'text-gray-600'
                    )}>
                    {task.description}
                  </p>
                </div>

                {!task.completed && task.action && (
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {completedTasks < totalTasks && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  const nextIncompleteTask = tasks.find(
                    task => !task.completed && !task.isExternal
                  );
                  if (nextIncompleteTask?.action) {
                    nextIncompleteTask.action();
                  }
                }}>
                Continue Setup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
