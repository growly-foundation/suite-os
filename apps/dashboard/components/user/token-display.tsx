import { formatNumber } from '@/lib/string.utils';

import { AssetIcon } from '../ui/asset-icon';

export interface TokenData {
  symbol: string;
  logoURI?: string;
  balance?: string | number;
  marketPrice?: number;
  usdValue: number;
}

interface TokenDisplayProps {
  token: TokenData;
  showBalance?: boolean;
  showPrice?: boolean;
  showValue?: boolean;
}

/**
 * Reusable component for displaying token information
 */
export function TokenDisplay({
  token,
  showBalance = true,
  showPrice = true,
  showValue = true,
}: TokenDisplayProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className="items-center flex justify-center flex-col text-black"
          style={{ width: 30, height: 30 }}>
          <AssetIcon logoURI={token.logoURI} symbol={token.symbol} />
        </div>
        <div>
          {showBalance && (
            <p className="text-sm font-medium">
              {token.balance} {token.symbol}
            </p>
          )}
          {showPrice && token.marketPrice && (
            <p className="text-xs text-muted-foreground">
              ${Math.abs(token.marketPrice).toFixed(2)}
            </p>
          )}
        </div>
      </div>
      {showValue && (
        <div className="flex items-center gap-1 text-xs">${formatNumber(token.usdValue)}</div>
      )}
    </div>
  );
}
