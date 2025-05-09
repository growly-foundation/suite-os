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
        <Card
          key={workflow.id}
          className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-r from-white to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-lg tracking-tight">{workflow.name}</h3>
                  <Badge
                    variant={workflow.status === 'active' ? 'default' : 'secondary'}
                    className="px-2 py-0.5 rounded-md font-medium uppercase text-[10px] tracking-wider">
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
          <CardFooter className="bg-gradient-to-b from-transparent to-muted/20 px-6 py-3 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-blue-50/50 transition-colors"
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
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-blue-50/50 hover:text-primary transition-colors">
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
