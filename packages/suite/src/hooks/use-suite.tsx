import { SuiteContext } from '@/components/providers/SuiteProvider';
import { useContext } from 'react';

export const useSuite = () => {
  const context = useContext(SuiteContext);
  if (!context) {
    throw new Error('useSuite must be used within a SuiteProvider');
  }
  return context;
};
