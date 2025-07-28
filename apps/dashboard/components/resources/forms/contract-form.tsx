import { ChainSelector } from '@/components/chains/chain-selecter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { mainnet } from 'viem/chains';

import { ContractValue } from '@getgrowly/core';

interface ContractFormProps {
  onChange: (data: ContractValue) => void;
  initialData?: Partial<ContractValue>;
}

export function ContractForm({ onChange, initialData }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractValue>({
    address: '',
    chainId: mainnet.id,
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
        <ChainSelector
          value={formData.chainId}
          onChange={value => handleChange({ chainId: value })}
        />
      </div>
    </div>
  );
}
