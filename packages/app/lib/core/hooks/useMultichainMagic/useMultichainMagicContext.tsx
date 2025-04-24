import { useContext } from 'react';
import { MultichainMagicContext } from '../../contexts/MultichainMagicContext';

export const useMultichainMagicContext = () => {
  return useContext(MultichainMagicContext);
};
