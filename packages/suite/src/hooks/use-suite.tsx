import { SuiteContext } from '@/components/providers/SuiteProvider';

export const useSuite = () => {
  const context = React.useContext(SuiteContext);
  if (!context) {
    throw new Error('useSuite must be used within a SuiteProvider');
  }
  return context;
};
