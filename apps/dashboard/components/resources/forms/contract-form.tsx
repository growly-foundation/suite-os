import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Network } from 'lucide-react';
import { useState } from 'react';

import { ContractResourceValue } from '@getgrowly/core';

interface ContractFormProps {
  onChange: (data: ContractResourceValue['value']) => void;
  initialData?: Partial<ContractResourceValue['value']>;
}

export function ContractForm({ onChange, initialData }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractResourceValue['value']>({
    address: '',
    network: 'ethereum',
    ...initialData,
  });

  const handleChange = (updates: Partial<ContractResourceValue['value']>) => {
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
      <Card>
        <CardContent className="pt-6 space-y-4">
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
            <input
              type="hidden"
              value={formData.network}
              onChange={e => handleChange({ network: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
