'use client';

import { PlusCircle, Workflow } from 'lucide-react';
import AnimatedBeamContainer from '../animated-beam/animated-beam-container';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useEffect } from 'react';
import { WorkflowsList } from './workflow-list';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';

export default function WorkflowManager() {
  const { organizationWorkflows: workflows, fetchOrganizationWorkflows: fetchWorkflows } =
    useDashboardState();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold">47</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" /> Workflows
        </h1>
        <Link href="/dashboard/workflows/new">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>
      {workflows.length > 0 ? (
        <WorkflowsList workflows={workflows} />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <AnimatedBeamContainer />
          <br />
          <h1 className="text-2xl font-bold">No workflows found</h1>
          <p className="text-muted-foreground">Create a workflow to get started.</p>
        </div>
      )}
    </div>
  );
}
