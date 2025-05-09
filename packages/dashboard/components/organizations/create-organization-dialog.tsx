import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardState } from '@/hooks/use-dashboard';

export const CreateOrganizationDialog = () => {
  const router = useRouter();
  const { createOrganization } = useDashboardState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [isLoading, setLoading] = useState(false);

  const handleCreateOrg = async () => {
    try {
      setLoading(true);
      await createOrganization(newOrgName, newOrgDescription);
      setLoading(false);
      setIsDialogOpen(false);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Create Organization</h3>
                <p className="text-sm text-muted-foreground">Start a new workspace</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new organization</DialogTitle>
          <DialogDescription>
            Add a new organization to manage projects and team members.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              placeholder="Acme Inc."
              value={newOrgName}
              onChange={e => setNewOrgName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-description">Organization description</Label>
            <Input
              id="org-description"
              placeholder="Description"
              value={newOrgDescription}
              onChange={e => setNewOrgDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateOrg} disabled={!newOrgName.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
