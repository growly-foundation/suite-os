import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AgentsEmptyStateProps {
  className?: string;
  resourceCount?: number;
}

export function AgentsEmptyState({ className, resourceCount = 0 }: AgentsEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Card className="max-w-2xl mx-auto text-center border-dashed">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Your First AI Agent
          </CardTitle>
          <CardDescription className="text-base text-gray-600 max-w-lg mx-auto">
            AI agents are the core of Suite. They help your users by providing intelligent responses
            based on your knowledge base and resources.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Provide 24/7 customer support</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Answer questions using your knowledge base</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Analyze onchain data and user behavior</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-row gap-3 justify-center pt-4">
            <Link href="/dashboard/agents/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Agent
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() =>
                window.open(
                  'https://intercom.help/growly-suite/en/articles/11975841-suite-installation-guide-for-browser-widget',
                  '_blank'
                )
              }>
              View Documentation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick tip */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mx-auto max-w-md">
            💡 <strong>Tip:</strong>{' '}
            {resourceCount > 0
              ? `You have ${resourceCount} resource${resourceCount > 1 ? 's' : ''} ready! Create an agent to start using them.`
              : 'Start by uploading some resources first, then create an agent that can use them to help your users.'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
