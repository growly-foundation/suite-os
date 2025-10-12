import { ChainSelector } from '@/components/chains/chain-selecter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChainConfig } from '@/hooks/use-chain-config';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { mainnet } from 'viem/chains';

import { ContractValue } from '@getgrowly/core';

interface ContractFormProps {
  onChange: (data: ContractValue) => void;
  initialData?: Partial<ContractValue>;
}

export function ContractForm({ onChange, initialData }: ContractFormProps) {
  const { selectedOrganization } = useDashboardState();
  const { hasChainsConfigured } = useChainConfig();
  const [formData, setFormData] = useState<ContractValue>(() => {
    const supportedChainIds = selectedOrganization?.supported_chain_ids;
    const firstSupportedChainId =
      supportedChainIds && supportedChainIds.length > 0 ? supportedChainIds[0] : null;

    return {
      address: '',
      chainId: firstSupportedChainId ?? mainnet.id,
      ...initialData,
    };
  });

  // Use ref to track if this is the initial render to prevent unnecessary onChange calls
  const isInitialRender = useRef(true);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleChange = useCallback((updates: Partial<ContractValue>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Notify parent after render when form data changes (but not on initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    onChangeRef.current(formData);
  }, [formData]);

  // Sync when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Sync when selectedOrganization loads or changes
  useEffect(() => {
    const supportedChainIds = selectedOrganization?.supported_chain_ids;
    const firstSupportedChainId =
      supportedChainIds && supportedChainIds.length > 0 ? supportedChainIds[0] : null;

    if (firstSupportedChainId && !formData.chainId) {
      setFormData(prev => ({
        ...prev,
        chainId: firstSupportedChainId,
      }));
    }
  }, [selectedOrganization?.supported_chain_ids]);

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
          supportedChainIds={selectedOrganization?.supported_chain_ids || undefined}
        />
        {!hasChainsConfigured && (
          <p className="text-sm text-muted-foreground">
            Please configure your blockchain networks in{' '}
            <a
              href="/dashboard/settings"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer">
              Settings
            </a>{' '}
            to select a network.
          </p>
        )}
      </div>
    </div>
  );
}
