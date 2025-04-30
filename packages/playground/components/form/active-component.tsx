import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppStackComponent } from '@/types/appstack';
import { useContext } from 'react';
import { AppContext } from '../AppProvider';

export function ActiveComponent() {
  const { activeComponent, setActiveComponent } = useContext(AppContext);

  return (
    <div className="grid gap-2">
      <Label htmlFor="chain">Component</Label>
      <Select
        value={activeComponent}
        onValueChange={(value: AppStackComponent) =>
          value ? setActiveComponent?.(value as AppStackComponent) : value
        }>
        <SelectTrigger>
          <SelectValue placeholder="Select component" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AppStackComponent.ChatWidget}>Chat Widget</SelectItem>
          <SelectItem value={AppStackComponent.DemoChatWidget}>Demo Chat Widget</SelectItem>
          <SelectItem value={AppStackComponent.StaticWidget}>Static Widget</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
