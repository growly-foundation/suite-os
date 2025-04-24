import { useContext } from 'react';
import { NativeMagicContext } from '../../contexts/NativeMagicContext';

export const useNativeMagicContext = () => {
  return useContext(NativeMagicContext);
};
