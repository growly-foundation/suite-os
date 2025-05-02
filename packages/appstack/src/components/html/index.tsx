import { payload, UserDefinedStep } from '@growly/sdk';

/**
 * Growly step element that can be used to define a step.
 */
const Step = ({
  children,
  ...stepProps
}: { children: React.ReactNode } & UserDefinedStep['payload']) => {
  return <div data-growly-step={payload({ type: 'step', payload: stepProps })}>{children}</div>;
};

export const GrowlyComponent = {
  Step,
};
