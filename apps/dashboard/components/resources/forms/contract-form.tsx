import { ChainSelector } from '@/components/chains/chain-selecter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';

import { ContractValue } from '@getgrowly/core';

interface ContractFormProps {
  onChange: (data: ContractValue) => void;
  initialData?: Partial<ContractValue>;
}

export function ContractForm({ onChange, initialData }: ContractFormProps) {
  const { selectedOrganization } = useDashboardState();
  const [formData, setFormData] = useState<ContractValue>({
    address: '',
    chainId: selectedOrganization?.supported_chain_ids?.[0] ?? mainnet.id,
    ...initialData,
  });

  const handleChange = (updates: Partial<ContractValue>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Notify parent after render when form data changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contract-address">Contract Address</Label>
        <Input
          id="contract-address"
          placeholder="0x..."
          value={formData.address}
          onChange={e => handleChange({ address: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Network</Label>
        <ChainSelector
          value={formData.chainId}
          onChange={value => handleChange({ chainId: value })}
          supportedChainIds={selectedOrganization?.supported_chain_ids || []}
        />
      </div>
    </div>
  );
}
