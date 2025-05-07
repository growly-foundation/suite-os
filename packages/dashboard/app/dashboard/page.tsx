import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, BarChart3, TrendingUp, Users, Settings } from 'lucide-react';
import { IconAi, IconSlideshow, IconWaveSine } from '@/components/icons';
import { CreateWorkflowDialog } from '@/components/workflows/create-workflow-dialog';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Tin!</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your workflows today.
            </p>
          </div>
          <div className="flex gap-3">
            <CreateWorkflowDialog title="Create Workflow" />
            <Button variant="outline">View Analytics</Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">24</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1,248</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +18% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">98.2%</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +2.4% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">156</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +8% from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/dashboard/workflows" className="growly-icon-button">
            <div className="p-2 rounded-full bg-white mb-2">
              <IconWaveSine />
            </div>
            <span className="text-sm font-medium">Workflows</span>
          </Link>
          <Link href="/dashboard/playground" className="growly-icon-button">
            <div className="p-2 rounded-full bg-white mb-2">
              <IconAi className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Playground</span>
          </Link>
          <Link href="/dashboard/resources" className="growly-icon-button">
            <div className="p-2 rounded-full bg-white mb-2">
              <IconSlideshow />
            </div>
            <span className="text-sm font-medium">Resources</span>
          </Link>
          <Link href="/dashboard/settings" className="growly-icon-button">
            <div className="p-2 rounded-full bg-white mb-2">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Recent Workflows */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Workflows</h2>
          <Button variant="ghost" className="text-primary" asChild>
            <Link href="/dashboard/workflows">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          {[
            {
              name: 'Customer Onboarding',
              description: 'Process for new customer registration and setup',
              executions: 245,
              success: 98,
            },
            {
              name: 'Support Ticket Handling',
              description: 'Automated workflow for managing support requests',
              executions: 189,
              success: 95,
            },
            {
              name: 'Lead Qualification',
              description: 'Process to qualify and route new leads',
              executions: 127,
              success: 92,
            },
          ].map((workflow, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div>
                <h3 className="font-medium">{workflow.name}</h3>
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{workflow.executions}</div>
                  <div className="text-xs text-muted-foreground">Executions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{workflow.success}%</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <Button variant="ghost" size="icon" className="text-primary">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
