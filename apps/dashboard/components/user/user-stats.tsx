import { WalletData } from '@/hooks/use-wallet-data';
import { formatAssetValue } from '@/lib/number.utils';

interface StatItemProps {
  label: string;
  value: number | string;
}

/**
 * Individual stat item component
 */
function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-2 flex flex-col items-center justify-start">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium text-md">{formatAssetValue(value as number)}</p>
    </div>
  );
}

/**
 * User statistics panel component
 */
export function UserStats({ walletData }: { walletData: WalletData }) {
  const totalNftCount = walletData.nftPositions.length;
  const totalTransactions = walletData.transactionItems.length;
  // Calculate unique days active based on transactionItems' timestamps
  const uniqueActiveDays = new Set(
    walletData.transactionItems
      .map((tx: any) => {
        // Use transfer timestamp if available, else fallback to tx.timestamp
        const ts = tx.transfers?.[0]?.timestamp || tx.timestamp;
        // Convert to date string (YYYY-MM-DD) for uniqueness
        return ts ? new Date(ts * 1000).toISOString().slice(0, 10) : null;
      })
      .filter(Boolean)
  );
  const daysActive = Array.from(uniqueActiveDays).length;

  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <StatItem label="Transactions (30d)" value={totalTransactions} />
      <StatItem label="NFTs" value={totalNftCount} />
      <StatItem label="Days Active (30d)" value={`${daysActive}/30`} />
    </div>
  );
}
