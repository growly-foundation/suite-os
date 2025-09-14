import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { formatAssetValue } from '@/lib/number.utils';
import { Copy, ExternalLink } from 'lucide-react';

import { TContractToken } from '@getgrowly/chainsmith/types';
import { getChainNameById } from '@getgrowly/chainsmith/utils';

interface TokenStackProps {
  tokens: TContractToken[];
  tokenSize?: number;
  maxTokens?: number;
  onCopyAddress?: (address: string) => void;
}

export function TokenStack({ tokens, tokenSize = 8, maxTokens = 3 }: TokenStackProps) {
  const { copyToClipboard } = useCopyToClipboard();
  const { handlePeekTokenMultichain } = usePeekExplorer();
  return (
    <div className="flex items-center gap-1">
      {/* Token Stack */}
      <div className="flex -space-x-1 relative">
        {tokens.slice(0, maxTokens).map((token, index) => (
          <DropdownMenu key={token.symbol}>
            <DropdownMenuTrigger className="focus:outline-none">
              <div
                className={`rounded-full ${
                  index > 0 ? 'hover:translate-y-1 transition-transform' : ''
                }`}
                style={{ zIndex: maxTokens - index, width: tokenSize, height: tokenSize }}>
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {token.symbol.charAt(0)}
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-90 p-4">
              <div className="space-y-4">
                {/* Token Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full">
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{token.symbol}</div>
                    <div className="text-sm text-gray-600">{token.name}</div>
                  </div>
                </div>

                {/* Token Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600">Balance</div>
                    <div className="font-medium text-gray-900">
                      {formatAssetValue(token.balance ?? 0)} {token.symbol}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Chain</div>
                    <Badge variant="outline" className="mt-1">
                      {getChainNameById(token.chainId)}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <DropdownMenuItem
                    className="w-full text-xs"
                    onClick={e => {
                      e.stopPropagation();
                      return token.address && copyToClipboard(token.address);
                    }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="w-full text-xs"
                    onClick={e => {
                      e.stopPropagation();
                      return token.address && handlePeekTokenMultichain(token.address);
                    }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Token Count Badge */}
      {tokens.length > 3 && (
        <Badge variant="secondary" className="ml-2">
          +{tokens.length - 3}
        </Badge>
      )}
    </div>
  );
}
