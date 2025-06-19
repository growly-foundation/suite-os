'use client';

import { Button } from '@/components/ui/button';
import { consumePersona } from '@/core/persona';
import { Award, ExternalLink } from 'lucide-react';
import { useTheme } from '@getgrowly/ui';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { Badge } from '../ui/badge';
import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';

interface UserProfileHeaderProps {
  user: ParsedUser;
}

/**
 * Themed user profile header component using the theme system
 */
export function ThemedUserProfileHeader({ user }: UserProfileHeaderProps) {
  const theme = useTheme();
  const userPersona = consumePersona(user);
  const nameService = userPersona.nameService();
  const dominantTrait = userPersona.dominantTrait();
  const dominantTraitScore = userPersona.dominantTraitScore();

  return (
    <div 
      className="flex flex-col items-center justify-center p-6 border-b"
      style={{ 
        backgroundColor: theme.background.card,
        borderColor: theme.border.default,
      }}
    >
      <AppUserAvatarWithStatus user={user} size={80} />
      <h3 
        className="font-semibold text-lg" 
        style={{ color: theme.text.default }}
      >
        {nameService?.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <WalletAddress truncate address={user.onchainData.id} />
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      <p 
        className="text-sm text-center mt-2"
        style={{ color: theme.text.muted }}
      >
        {user.offchainData?.description || 'No description'}
      </p>

      {/* Reputation */}
      <div className="flex items-center gap-2 mt-3">
        <Badge 
          variant="secondary" 
          style={{
            backgroundColor: theme.brand.accent + '20', // Adding transparency
            color: theme.brand.accent
          }}
        >
          <Award className="h-3 w-3 mr-1" />
          {dominantTrait?.toString() || 'No dominant trait'} • {dominantTraitScore || 'No score'}
        </Badge>
      </div>
    </div>
  );
}
