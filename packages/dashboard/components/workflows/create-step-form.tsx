'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateStepFormProps {
  onSubmit: (name: string, description: string) => void;
  isLoading: boolean;
}

export function CreateStepForm({ onSubmit, isLoading }: CreateStepFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name) return;
    onSubmit(name, description);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="step-name">Step Name</Label>
        <Input
          id="step-name"
          placeholder="Enter step name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded-lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="step-description">Description</Label>
        <Textarea
          id="step-description"
          placeholder="Enter step description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="rounded-lg min-h-[80px]"
        />
      </div>
      <div className="pt-2">
        <Button
          className="bg-coinbase-blue hover:bg-coinbase-blue/90 text-white w-full"
          onClick={handleSubmit}
          disabled={isLoading || !name}>
          {isLoading ? 'Adding...' : 'Add Step'}
        </Button>
      </div>
    </div>
  );
}
