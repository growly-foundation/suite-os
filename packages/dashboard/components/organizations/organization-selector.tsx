'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Update the mock data to include descriptions and remove statistics
const organizations = [
  {
    id: '1',
    name: 'Acme Inc',
    role: 'Admin',
    description: 'A global leader in innovative solutions for enterprise businesses.',
  },
  {
    id: '2',
    name: 'Globex Corporation',
    role: 'Member',
    description: 'Specializing in cutting-edge technology and software development.',
  },
  {
    id: '3',
    name: 'Initech',
    role: 'Owner',
    description: 'Providing business process automation and consulting services.',
  },
];

export function OrganizationSelector() {
  const router = useRouter();
  const [newOrgName, setNewOrgName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectOrg = (orgId: string) => {
    // In a real app, you would set the selected organization in your auth context/state
    console.log(`Selected organization: ${orgId}`);
    // Redirect to dashboard or home page
    router.push('/dashboard');
  };

  const handleCreateOrg = () => {
    // In a real app, you would call your API to create a new organization
    console.log(`Creating new organization: ${newOrgName}`);
    setIsDialogOpen(false);
    // Redirect to the new organization setup or dashboard
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Select Organization</h1>
        <p className="text-muted-foreground">Choose an organization to continue</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map(org => (
          <Card
            key={org.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => handleSelectOrg(org.id)}>
            {/* Replace the card content with description instead of statistics */}
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg">{org.name}</h3>
                  <p className="text-sm text-muted-foreground">{org.role}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrg} disabled={!newOrgName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
