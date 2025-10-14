import { Progress } from '@/components/ui/progress';
import { useDashboardState } from '@/hooks/use-dashboard';
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

interface DashboardEmptyStateProps {
  className?: string;
  onCreateAgent?: () => void;
  onAddResource?: () => void;
  onImportUsers?: () => void;
  hasAgents?: boolean;
  hasResources?: boolean;
  hasUsers?: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action?: () => void;
  isExternal?: boolean;
}

export function DashboardEmptyState({
  className,
  onCreateAgent,
  onAddResource,
  hasAgents = false,
  hasResources = false,
}: DashboardEmptyStateProps) {
  const router = useRouter();
  const { selectedOrganization } = useDashboardState();

  const hasChainsConfigured =
    !!selectedOrganization?.supported_chain_ids &&
    selectedOrganization.supported_chain_ids.length > 0;

  const steps: OnboardingStep[] = [
    {
      id: 'configure-chains',
      title: 'Set up channels to connect with your customers',
      description: 'Configure blockchain networks for your workspace',
      icon: Globe,
      completed: hasChainsConfigured,
      action: () => router.push('/onboarding/chains'),
    },
    {
      id: 'add-content',
      title: 'Upload resources to power your AI',
      description: 'Upload documents, links, or contracts for your agents to use',
      icon: FileStack,
      completed: hasResources,
      action: onAddResource || (() => router.push('/dashboard/resources')),
    },
    {
      id: 'help-center-live',
      title: 'Set your AI Agent live to give support 24/7',
      description: 'Deploy AI agents to assist your users automatically',
      icon: Bot,
      completed: hasAgents,
      action: onCreateAgent || (() => router.push('/dashboard/agents')),
    },
    {
      id: 'import-users-from-privy',
      title: 'Import users from external sources',
      description: 'Manage existing users from external sources',
      icon: Users,
      completed: false,
      action: () => router.push('/dashboard/users/import'),
    },
    {
      id: 'set-outbound',
      title: 'Set an Outbound message live',
      description: 'Learn how to integrate Suite into your application',
      icon: Globe,
      completed: false,
      isExternal: true,
      action: () => {
        window.open('https://docs.getsuite.io/en/collections/14174088-integrations', '_blank');
      },
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length - 1; // Exclude external step from count
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={cn('flex h-full w-full', className)}>
      {/* Left Side - Onboarding Steps */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <CheckCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Get set up</h1>
              <span className="text-sm text-muted-foreground">
                • {completedSteps} / {totalSteps} steps
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-1" />
          </div>

          {/* Steps List */}
          <div className="space-y-0 border-l-2 border-border ml-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn('relative pl-8 pb-8', index === steps.length - 1 && 'pb-0')}>
                {/* Step Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-0 -ml-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 bg-background',
                    step.completed
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground bg-background'
                  )}>
                  {step.completed && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                  {!step.completed && <Circle className="h-2 w-2 fill-muted-foreground" />}
                </div>

                {/* Step Content */}
                <button
                  onClick={step.action}
                  disabled={step.completed}
                  className={cn(
                    'w-full text-left group transition-all',
                    !step.completed && 'hover:opacity-80 cursor-pointer',
                    step.completed && 'opacity-60 cursor-default'
                  )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={cn(
                            'font-medium',
                            step.completed && 'line-through text-muted-foreground'
                          )}>
                          {step.title}
                        </h3>
                        {step.isExternal && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {!step.completed && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Banner */}
      <div className="hidden lg:flex lg:w-[600px] items-center justify-center p-8">
        <div className="relative w-full h-full max-w-lg max-h-[700px]">
          <img
            src="/banners/suite-banner-oil.png"
            alt="Suite Preview"
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
