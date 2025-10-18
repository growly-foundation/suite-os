import { DocumentationFeed } from '@/components/dashboard/documentation-feed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Bot, FileStack, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardEmptyStateProps {
  className?: string;
  onCreateAgent?: () => void;
  onAddResource?: () => void;
  onImportUsers?: () => void;
}

export function DashboardEmptyState({
  className,
  onCreateAgent,
  onAddResource,
  onImportUsers,
}: DashboardEmptyStateProps) {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Create Your First Agent',
      description: 'Set up an AI agent to start helping your users',
      icon: Bot,
      action: onCreateAgent || (() => router.push('/dashboard/agents')),
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      primary: true,
    },
    {
      title: 'Import users',
      description: 'Manage onchain users by importing them from smart contract or Persona',
      icon: Users,
      action: onImportUsers || (() => router.push('/dashboard/users')),
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      primary: false,
    },
    {
      title: 'Upload Resources',
      description: 'Add documents, links, or contracts for your agents to use',
      icon: FileStack,
      action: onAddResource || (() => router.push('/dashboard/resources')),
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'View Documentation',
      description: 'Learn how to integrate Suite into your application',
      icon: ArrowRight,
      action: () =>
        window.open(
          'https://intercom.help/growly-suite/en/articles/11975841-suite-installation-guide-for-browser-widget',
          '_blank'
        ),
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
  ];

  return (
    <div className={cn('flex flex-col gap-6 p-6 md:gap-8 md:p-8', className)}>
      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-4 max-w-6xl mx-auto">
        {quickActions.map(action => (
          <Card
            key={action.title}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
              action.primary && 'ring-2 ring-blue-500 ring-opacity-20'
            )}
            onClick={action.action}>
            <CardHeader className="pb-3">
              <div
                className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-lg mb-3',
                  action.color
                )}>
                <action.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription className="text-sm">{action.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant={action.primary ? 'default' : 'outline'} size="sm" className="w-full">
                {action.primary ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Placeholder */}
      <div className="grid gap-4 md:grid-cols-4 max-w-4xl mx-auto opacity-50">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">New Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-300">0</div>
            <p className="text-xs text-gray-400">No users yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Agents</CardTitle>
            <Bot className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-300">0</div>
            <p className="text-xs text-gray-400">Create your first agent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resources</CardTitle>
            <FileStack className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-300">0</div>
            <p className="text-xs text-gray-400">Upload resources</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Workflows</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-300">0</div>
            <p className="text-xs text-gray-400">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Feed for new users */}
      <div className="max-w-6xl mx-auto">
        <DocumentationFeed showHeader={true} />
      </div>
    </div>
  );
}
