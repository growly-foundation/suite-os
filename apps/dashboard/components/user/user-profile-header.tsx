import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { Check, Copy, ExternalLink } from 'lucide-react';

import { ParsedUser } from '@getgrowly/core';

import { Identity } from '../identity';
import { BlockscanSvg } from '../svg/blockscan';
import { OpenSeaColor } from '../svg/opensea';

interface UserProfileHeaderProps {
  user: ParsedUser;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const walletAddress = user.entities.walletAddress;
  const { copyToClipboard, copied } = useCopyToClipboard();
  const { handlePeekAddressMultichain, handlePeekNFTMultichain } = usePeekExplorer();

  return (
    <div className="flex items-center justify-between">
      {/* Left Side - User Info */}
      <div className="flex items-center gap-4">
        {/* Avatar + Name + Address */}
        <Identity
          address={walletAddress}
          avatarSize={64}
          showAvatar
          showName
          showAddress={true}
          nameTooltip={false}
          addressTooltip={false}
          spacing="normal"
          nameClassName="text-2xl font-bold"
          addressClassName="text-sm text-muted-foreground"
          truncateLength={{ startLength: 6, endLength: 4 }}
        />

        {/* Copy button for address */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(walletAddress)}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => handlePeekAddressMultichain(walletAddress)}>
              <BlockscanSvg className="h-4 w-4 mr-2 " /> View on Blockscan
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => handlePeekNFTMultichain(walletAddress)}>
              <OpenSeaColor className="h-4 w-4 mr-2" /> View on OpenSea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
