import { consumePersona } from '@/core/persona';

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
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
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
    <div className="grid grid-cols-2 gap-3 text-sm">
      <StatItem label="Transactions" value={totalTransactions} />
      <StatItem label="NFTs" value={totalNftCount} />
      <StatItem label="Days Active" value={daysActive} />
    </div>
  );
}
