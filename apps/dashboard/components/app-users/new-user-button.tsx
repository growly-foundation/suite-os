import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const NewUserButton = () => {
  return (
    <Button className="rounded-full">
      <Plus className="mr-2 h-4 w-4" />
      New User
    </Button>
  );
};
