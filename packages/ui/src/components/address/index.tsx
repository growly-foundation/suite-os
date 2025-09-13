import { cn } from '@/lib/utils';

export const truncateAddress = (address: string, startLength = 6, endLength = 4) => {
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const WalletAddress = ({
  address,
  truncate,
  truncateLength = { startLength: 6, endLength: 4 },
  className,
  ...props
}: {
  address: string;
  truncate?: boolean;
  truncateLength?: { startLength: number; endLength: number };
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      onClick={() => navigator.clipboard.writeText(address)}
      className="hover:text-primary cursor-pointer"
      {...props}>
      <span className={cn('text-muted-foreground ', className)}>
        {truncate
          ? truncateAddress(address, truncateLength?.startLength, truncateLength?.endLength)
          : address}
      </span>
    </div>
  );
};
