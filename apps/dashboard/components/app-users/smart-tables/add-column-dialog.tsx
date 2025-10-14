'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, Globe, Hash, Sparkles, Text, Users, Zap } from 'lucide-react';
import { useState } from 'react';

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'guildxyz'
  | 'farcaster'
  | 'ai-generation'
  | 'user-input'
  | 'scrape-website'
  | 'read-file'
  | 'regex'
  | 'linkedin'
  | 'instagram'
  | 'apollo'
  | 'findymail'
  | 'domain-check';

export interface CustomColumn {
  id: string;
  name: string;
  type: ColumnType;
  config?: Record<string, any>;
}

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (column: CustomColumn) => void;
}

const COLUMN_TYPES = [
  {
    category: 'Basic Types',
    types: [
      { value: 'text', label: 'Text', icon: Text, description: 'Single line text' },
      { value: 'number', label: 'Number', icon: Hash, description: 'Numeric value' },
      { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    ],
  },
  {
    category: 'AI & Generation',
    types: [
      {
        value: 'ai-generation',
        label: 'Run AI Generation',
        icon: Sparkles,
        description: 'Generate content with AI',
      },
      {
        value: 'user-input',
        label: 'User Input',
        icon: FileText,
        description: 'Manual text input',
      },
    ],
  },
  {
    category: 'Web & Data',
    types: [
      {
        value: 'scrape-website',
        label: 'Scrape Website',
        icon: Globe,
        description: 'Extract data from websites',
      },
      {
        value: 'read-file',
        label: 'Read File',
        icon: FileText,
        description: 'Read PDF or image files',
      },
      { value: 'regex', label: 'Run Regex', icon: Zap, description: 'Pattern matching' },
    ],
  },
  {
    category: 'Social & Integrations',
    types: [
      {
        value: 'linkedin',
        label: 'LinkedIn',
        icon: Users,
        description: 'Scrape LinkedIn profiles',
      },
      {
        value: 'instagram',
        label: 'Instagram',
        icon: Users,
        description: 'Scrape Instagram profiles',
      },
      { value: 'farcaster', label: 'Farcaster', icon: Users, description: 'Farcaster integration' },
      { value: 'guildxyz', label: 'Guild.xyz', icon: Users, description: 'Guild.xyz integration' },
    ],
  },
  {
    category: 'Tools',
    types: [
      {
        value: 'apollo',
        label: 'Apollo People Profiles',
        icon: Users,
        description: 'Search Apollo database',
      },
      { value: 'findymail', label: 'Findymail', icon: Users, description: 'Email finding tool' },
      {
        value: 'domain-check',
        label: 'Check Domain',
        icon: Globe,
        description: 'Verify domain availability',
      },
    ],
  },
];

export function AddColumnDialog({ open, onOpenChange, onAdd }: AddColumnDialogProps) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<ColumnType>('text');

  const handleAdd = () => {
    if (!columnName.trim()) return;

    const newColumn: CustomColumn = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: columnName,
      type: columnType,
      config: {},
    };

    onAdd(newColumn);
    setColumnName('');
    setColumnType('text');
    onOpenChange(false);
  };

  const handleTypeSelect = (type: ColumnType) => {
    setColumnType(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
          <DialogDescription>
            Choose a column type and give it a name. You can edit values in this column later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="column-name">Column Name</Label>
            <Input
              id="column-name"
              placeholder="e.g., Notes, Status, Priority..."
              value={columnName}
              onChange={e => setColumnName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Column Type</Label>
            <Select value={columnType} onValueChange={value => setColumnType(value as ColumnType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select column type" />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPES.map(category => (
                  <div key={category.category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {category.category}
                    </div>
                    {category.types.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                    <Separator className="my-1" />
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column type grid view */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Or browse all column types:</div>
            <div className="space-y-4">
              {COLUMN_TYPES.map(category => (
                <div key={category.category}>
                  <h4 className="text-sm font-semibold mb-2">{category.category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {category.types.map(type => {
                      const Icon = type.icon;
                      const isSelected = columnType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => handleTypeSelect(type.value as ColumnType)}
                          className={`p-3 rounded-lg border-2 text-left transition-all hover:border-primary/50 hover:bg-muted/50 ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background'
                          }`}>
                          <div className="flex items-start gap-2">
                            <Icon
                              className={`h-4 w-4 mt-0.5 ${isSelected ? 'text-primary' : ''}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                                {type.label}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!columnName.trim()}>
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
