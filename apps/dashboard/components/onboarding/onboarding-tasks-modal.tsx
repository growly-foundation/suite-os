'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import React from 'react';

interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
  description: string;
  link?: string;
  actionLabel?: string;
}

interface OnboardingTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: OnboardingTask[];
  onTaskAction?: (taskId: string) => void;
}

export function OnboardingTasksModal({
  isOpen,
  onClose,
  tasks,
  onTaskAction,
}: OnboardingTasksModalProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Get Started with Suite</DialogTitle>
          <DialogDescription>
            Complete these tasks to set up your organization and start using Suite effectively.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {index + 1}. {task.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {task.completed ? '✓ Completed' : '○ Pending'}
                  </div>
                  <div className="flex gap-2">
                    {task.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(task.link, '_blank')}
                        className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Guide
                      </Button>
                    )}
                    {!task.completed && task.actionLabel && (
                      <Button size="sm" onClick={() => onTaskAction?.(task.id)} className="text-xs">
                        {task.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
