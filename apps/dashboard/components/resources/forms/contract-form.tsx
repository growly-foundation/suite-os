import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Network } from 'lucide-react';
import { useState } from 'react';

import { ContractValue } from '@getgrowly/core';

interface ContractFormProps {
  onChange: (data: ContractValue) => void;
  initialData?: Partial<ContractValue>;
}

export function ContractForm({ onChange, initialData }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractValue>({
    address: '',
    network: 'mainnet',
    ...initialData,
  });

  const handleChange = (updates: Partial<ContractValue>) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        ...updates,
      };
      onChange(updatedData);
      return updatedData;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contract-address">Contract Address</Label>
        <Input
          id="contract-address"
          placeholder="0x..."
          value={formData.address}
          onChange={e => handleChange({ address: e.target.value })}
          className="pl-10"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Network</Label>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Network className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ethereum Mainnet</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
