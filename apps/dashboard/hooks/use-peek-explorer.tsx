import { TChainName } from '@getgrowly/chainsmith/types';

export const usePeekExplorer = () => {
  const handlePeekAddressOnEtherscan = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  const handlePeekAddressOnBasescan = (address: string) => {
    window.open(`https://basescan.org/address/${address}`, '_blank');
  };

  const handlePeekTransactionOnEtherscan = (transactionHash: string) => {
    window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank');
  };

  const handlePeekTransactionOnBasescan = (transactionHash: string) => {
    window.open(`https://basescan.org/tx/${transactionHash}`, '_blank');
  };

  const handlePeekAddressMultichain = (address: string, chain: TChainName) => {
    if (chain === 'mainnet') {
      handlePeekAddressOnEtherscan(address);
    } else if (chain === 'base') {
      handlePeekAddressOnBasescan(address);
    }
  };

  const handlePeekTransactionMultichain = (transactionHash: string, chain: TChainName) => {
    if (chain === 'mainnet') {
      handlePeekTransactionOnEtherscan(transactionHash);
    } else if (chain === 'base') {
      handlePeekTransactionOnBasescan(transactionHash);
    }
  };

  return {
    handlePeekAddressOnEtherscan,
    handlePeekAddressOnBasescan,
    handlePeekTransactionOnEtherscan,
    handlePeekTransactionOnBasescan,
    handlePeekAddressMultichain,
    handlePeekTransactionMultichain,
  };
};
