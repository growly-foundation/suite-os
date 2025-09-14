import { consumePersona } from '@/core/persona';
import { formatAssetValue } from '@/lib/number.utils';

import { ParsedUser } from '@getgrowly/core';

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
export function UserStats({ user }: { user: ParsedUser }) {
  const userPersona = consumePersona(user);
  const totalNftCount = parseInt(userPersona.totalNftCount().toString());
  const totalTransactions = parseInt(userPersona.totalMultichainTransactions().toString());
  const daysActive = userPersona.dayActive() || 0;

  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <StatItem label="Transactions" value={totalTransactions} />
      <StatItem label="NFTs" value={totalNftCount} />
      <StatItem label="Days Active" value={daysActive} />
    </div>
  );
}
