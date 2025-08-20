'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import React from 'react';

interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
  description: string;
  link?: string;
}

interface OnboardingStatusProps {
  tasks: OnboardingTask[];
  onTaskClick?: (taskId: string) => void;
}

export function OnboardingStatus({ tasks, onTaskClick }: OnboardingStatusProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <Card className="mx-2 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Onboarding Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {completedTasks} of {totalTasks} completed
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
              onClick={() => onTaskClick?.(task.id)}>
              <div className="mt-0.5">
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>
              {task.link && <ExternalLink className="h-3 w-3 text-muted-foreground mt-1" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
