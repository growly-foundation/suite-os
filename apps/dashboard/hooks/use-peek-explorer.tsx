export const usePeekExplorer = () => {
  const handlePeekAddressMultichain = (address: string) => {
    window.open(`https://blockscan.com/address/${address}#portfolios`);
  };

  const handlePeekTransactionMultichain = (transactionHash: string) => {
    window.open(`https://blockscan.com/tx/${transactionHash}`);
  };

  const handlePeekTokenMultichain = (address: string) => {
    window.open(`https://blockscan.com/token/${address}`);
  };

  return {
    handlePeekAddressMultichain,
    handlePeekTransactionMultichain,
    handlePeekTokenMultichain,
  };
};
