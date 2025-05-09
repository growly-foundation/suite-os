'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, ChevronRight, Cpu, FileText, MoreHorizontal, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { agents } from '@/lib/data/mock';
import { Status } from '@growly/core';

// Helper function to get model icon and color
function getModelInfo(model: string) {
  switch (model.toLowerCase()) {
    case 'gpt-4':
    case 'gpt-3.5-turbo':
      return { color: 'from-green-500 to-emerald-700', icon: <Bot className="h-5 w-5" /> };
    case 'claude-3':
    case 'claude-2':
      return { color: 'from-purple-500 to-violet-700', icon: <Bot className="h-5 w-5" /> };
    case 'llama-3':
      return { color: 'from-yellow-500 to-amber-700', icon: <Bot className="h-5 w-5" /> };
    case 'mistral-large':
      return { color: 'from-blue-500 to-indigo-700', icon: <Bot className="h-5 w-5" /> };
    default:
      return { color: 'from-gray-500 to-gray-700', icon: <Bot className="h-5 w-5" /> };
  }
}

export function AgentsList() {
  // In a real app, you would fetch agents for the selected organization
  const [organizationAgents] = useState(agents.filter(agent => agent.organization_id === '1'));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {organizationAgents.map(agent => {
        const { color, icon } = getModelInfo(agent.model);
        return (
          <Card key={agent.id} className="overflow-hidden transition-all hover:shadow-md">
            <div className={`h-2 bg-gradient-to-r ${color}`} />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.model}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {agent.description || 'No description provided'}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                  <Power className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {agent.status === Status.Active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                  <FileText className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-xs font-medium">{agent.workflows.length} Flows</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                  <Cpu className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-xs font-medium">{agent.resources.length} Resources</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={agent.status === Status.Active ? 'default' : 'secondary'}
                  className="px-2 py-0 text-xs">
                  {agent.status}
                </Badge>
                {agent.workflows.length > 0 && (
                  <Badge variant="outline" className="px-2 py-0 text-xs">
                    {agent.workflows.length} workflows
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link href={`/dashboard/agents/${agent.id}`} className="w-full">
                <Button
                  variant="ghost"
                  className="w-full rounded-none h-10 justify-between border-t">
                  Manage Agent
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
