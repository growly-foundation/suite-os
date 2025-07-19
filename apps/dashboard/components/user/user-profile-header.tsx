import { Button } from '@/components/ui/button';
import { consumePersona } from '@/core/persona';
import { Award, ExternalLink } from 'lucide-react';
import { Address } from 'viem';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';
import { Badge } from '../ui/badge';

interface UserProfileHeaderProps {
  user: ParsedUser;
}

/**
 * User profile header component displaying avatar, name, wallet address,
 * description and dominant trait information
 */
export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const userPersona = consumePersona(user);
  const nameService = userPersona.nameService();
  const dominantTrait = userPersona.dominantTrait();
  const dominantTraitScore = userPersona.dominantTraitScore();

  return (
    <div className="flex flex-col items-center justify-center p-6 border-b bg-white">
      <AppUserAvatarWithStatus
        walletAddress={user.personaData.id as Address}
        name={user.name}
        online={user.chatSession.status}
      />
      <h3 className="font-semibold text-lg">{nameService?.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <WalletAddress truncate address={user.personaData.id} />
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-sm text-center text-muted-foreground mt-2">
        {user.offchainData?.description || 'No description'}
      </p>

      {/* Reputation */}
      <div className="flex items-center gap-2 mt-3">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Award className="h-3 w-3 mr-1" />
          {dominantTrait?.toString() || 'No dominant trait'} • {dominantTraitScore || 'No score'}
        </Badge>
      </div>
    </div>
  );
}
