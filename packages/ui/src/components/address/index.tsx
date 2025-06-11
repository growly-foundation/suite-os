export const truncateAddress = (address: string, startLength = 6, endLength = 4) => {
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const WalletAddress = ({
  address,
  truncate,
  truncateLength = { startLength: 6, endLength: 4 },
}: {
  address: string;
  truncate?: boolean;
  truncateLength?: { startLength: number; endLength: number };
}) => {
  return (
    <div
      onClick={() => navigator.clipboard.writeText(address)}
      className="hover:text-primary cursor-pointer">
      <span className="font-mono text-sm text-muted-foreground ">
        {truncate
          ? truncateAddress(address, truncateLength?.startLength, truncateLength?.endLength)
          : address}
      </span>
    </div>
  );
};
