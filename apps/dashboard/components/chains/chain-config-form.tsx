'use client';

import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { getChainFeaturesWithMetadata } from '@/core/chain-features';
import { SUPPORTED_CHAINS } from '@/core/chains';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ChainIcon } from '../ui/chain-icon';

interface ChainConfigFormProps {
  selectedChainIds?: number[];
  onSave: (chainIds: number[]) => Promise<void>;
  maxChains?: number;
  showTitle?: boolean;
}

// Component to display feature support badges
function ChainFeatureBadges({ chainId }: { chainId: number }) {
  const enabledFeatures = getChainFeaturesWithMetadata(chainId);

  if (enabledFeatures.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {enabledFeatures.map(feature => (
        <span
          key={feature.key}
          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${feature.badgeStyle.backgroundColor} ${feature.badgeStyle.textColor}`}
          title={feature.description}>
          {feature.title}
        </span>
      ))}
    </div>
  );
}

type ChainConfigFormValues = {
  selectedChainIds: number[];
};

export function ChainConfigForm({
  selectedChainIds = [],
  onSave,
  maxChains = 2,
  showTitle = true,
}: ChainConfigFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<ChainConfigFormValues>({
    defaultValues: { selectedChainIds },
    mode: 'onChange',
  });

  const currentSelected = form.watch('selectedChainIds');
  const { isDirty } = form.formState;
  const canSubmit = useMemo(() => {
    const selectedCount = currentSelected?.length || 0;
    return isDirty && selectedCount > 0;
  }, [isDirty, currentSelected]);

  const toggleChain = (chainId: number) => {
    const value = form.getValues('selectedChainIds') || [];
    const isSelected = value.includes(chainId);
    if (isSelected) {
      form.setValue(
        'selectedChainIds',
        value.filter(id => id !== chainId),
        { shouldDirty: true }
      );
      return;
    }
    if (value.length >= maxChains) return;
    form.setValue('selectedChainIds', [...value, chainId], { shouldDirty: true });
  };

  const onSubmit = async (values: ChainConfigFormValues) => {
    setIsSaving(true);
    try {
      await onSave(values.selectedChainIds);
      form.reset(values);
    } finally {
      setIsSaving(false);
    }
  };

  const chains = useMemo(() => [...SUPPORTED_CHAINS].sort((a, b) => a.id - b.id), []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {showTitle && (
          <div>
            <h3 className="text-lg font-medium">Chain Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Select up to {maxChains} blockchain networks for your organization. Feature support
              varies by chain.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="selectedChainIds"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel>
                Supported Chains ({currentSelected?.length || 0}/{maxChains} selected)
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chains.map(chain => {
                  const isSelected = (currentSelected || []).includes(chain.id);
                  const isDisabled = !isSelected && (currentSelected || []).length >= maxChains;

                  return (
                    <div
                      key={chain.id}
                      onClick={() => !isDisabled && toggleChain(chain.id)}
                      className={cn(
                        'relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                        'hover:bg-muted/50',
                        isSelected ? 'border-primary bg-primary/5' : 'border-border',
                        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                      )}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                          e.preventDefault();
                          toggleChain(chain.id);
                        }
                      }}
                      aria-pressed={isSelected}
                      aria-disabled={isDisabled}>
                      <ChainIcon chainIds={[chain.id]} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{chain.name}</div>
                        <div className="text-xs text-muted-foreground">Chain ID: {chain.id}</div>
                        <ChainFeatureBadges chainId={chain.id} />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving || !canSubmit} className="min-w-[120px]">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
