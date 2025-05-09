'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, MoreHorizontal, Play, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AggregatedWorkflow } from '@growly/core';

export function WorkflowsList({ workflows }: { workflows: AggregatedWorkflow[] }) {
  const toggleWorkflowStatus = (workflowId: string) => {
    // TODO: Update workflow status
  };

  return (
    <div className="space-y-4">
      {workflows.map(workflow => (
        <Card key={workflow.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{workflow.name}</h3>
                  <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {workflow.description || 'No description provided'}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleWorkflowStatus(workflow.id)}>
                    {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
              </div>
              <div>{workflow.steps?.length || 0} steps</div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => toggleWorkflowStatus(workflow.id)}>
              {workflow.status === 'active' ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run
                </>
              )}
            </Button>
            <Link href={`/dashboard/workflows/${workflow.id}`}>
              <Button variant="ghost" size="sm">
                Edit Workflow
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
