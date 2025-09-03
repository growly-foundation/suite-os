import { Button } from '@/components/ui/button';
import { useSuiteSession } from '@/hooks/use-session';
import { cn, text } from '@/styles/theme';
import { X } from 'lucide-react';

import { AnimatedBuster, BRAND_NAME_CAPITALIZED } from '@getgrowly/ui';

export const PanelHeader = () => {
  const { togglePanel, agent, isAgentThinking } = useSuiteSession();
  return (
    <div className="gas-flex gas-justify-between gas-items-center">
      <div className="gas-flex gas-items-center gas-space-x-3">
        <AnimatedBuster width={40} height={40} state={isAgentThinking ? 'writing' : 'idle'} />
        <div>
          <h2 className={cn('gas-font-semibold', text.headline)}>
            {agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
          </h2>
          <p
            className={cn(
              'gas-text-sm gas-opacity-90 gas-transition-opacity gas-duration-300',
              text.base
            )}>
            {isAgentThinking ? 'Thinking...' : 'Typically replies in a few minutes'}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={togglePanel} style={{ cursor: 'pointer' }}>
        <X className="gas-h-5 gas-w-5" />
      </Button>
    </div>
  );
};
