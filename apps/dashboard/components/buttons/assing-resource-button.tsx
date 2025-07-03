import { useDashboardState } from '@/hooks/use-dashboard';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import {
  AggregatedAgent,
  ParsedResource,
  Resource,
  ResourceType,
  TypedResource,
} from '@getgrowly/core';

import { ResourceListItem } from '../resources/resource-list-item';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { PrimaryButton } from './primary-button';

type Props = {
  agent: AggregatedAgent;
  onUpdate: (agent: AggregatedAgent) => void;
};

const AssignResourceButton = ({ agent, onUpdate }: Props) => {
  const { organizationResources } = useDashboardState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResources, setSelectedResources] = useState<Resource[]>([...agent.resources]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter resources by organization and search query.
  const filteredResources = organizationResources.filter(resource =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveWorkflows = async () => {
    setIsSaving(true);
    try {
      const updatedAgent = {
        ...agent,
        resources: selectedResources as ParsedResource[],
      };
      onUpdate(updatedAgent);
    } catch (error) {
      toast.error('Failed to update agent resources');
    }
    setIsDialogOpen(false);
    setIsSaving(false);
  };

  const isResourceAssigned = (resourceId: string) =>
    selectedResources.some(r => r.id === resourceId);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <PrimaryButton disabled={isSaving}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Resources
        </PrimaryButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Resources</DialogTitle>
          <DialogDescription>
            Select resources to assign to this agent. The agent will be able to load these resources
            to expand their capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] pr-4">
            {filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground text-center py-4">No resources found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResources.map(resource => (
                  <ResourceListItem
                    key={resource.id}
                    className={isResourceAssigned(resource.id) ? 'bg-primary/5' : ''}
                    resource={resource as TypedResource<ResourceType>}
                    onClick={() => {
                      let updatedResources = selectedResources;
                      if (isResourceAssigned(resource.id)) {
                        updatedResources = selectedResources.filter(r => r.id !== resource.id);
                      } else {
                        updatedResources = [...selectedResources, resource];
                      }
                      setSelectedResources(updatedResources);
                    }}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveWorkflows} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignResourceButton;
