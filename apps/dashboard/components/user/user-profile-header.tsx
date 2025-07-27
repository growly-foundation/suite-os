import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { consumePersona } from '@/core/persona';
import { Copy, ExternalLink, Share2 } from 'lucide-react';

import { ParsedUser } from '@getgrowly/core';
import { RandomAvatar } from '@getgrowly/ui';

interface UserProfileHeaderProps {
  user: ParsedUser;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const walletAddress = user.entities.walletAddress;
  const persona = consumePersona(user);
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left Side - User Info */}
      <div className="flex items-center gap-4">
        {/* Profile Picture */}
        <div className="h-16 w-16">
          <RandomAvatar
            address={walletAddress}
            ensAvatar={persona.nameService().avatar}
            size={64}
          />
        </div>

        {/* User Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{persona.nameService().name || shortAddress}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{shortAddress}</span>
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Share Profile</DropdownMenuItem>
            <DropdownMenuItem>Copy Link</DropdownMenuItem>
            <DropdownMenuItem>Export Data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
