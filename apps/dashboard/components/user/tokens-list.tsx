'use client';

import { consumePersona } from '@/core/persona';

import { ParsedUser } from '@getgrowly/core';

import { TokenData, TokenDisplay } from './token-display';

interface TokensListProps {
  user: ParsedUser;
  filter?: (token: TokenData) => boolean;
  limit?: number;
}

/**
 * Component for displaying a user's token holdings in a list format
 */
export function TokensList({
  user,
  filter = token => token.usdValue > 1,
  limit = 10,
}: TokensListProps) {
  const userPersona = consumePersona(user);
  const tokens = userPersona.universalTokenList().filter(filter).slice(0, limit);

  if (tokens.length === 0) {
    return <p className="text-sm text-muted-foreground">No tokens found</p>;
  }

  return (
    <div className="space-y-3">
      {tokens.map((token, index) => (
        <TokenDisplay key={index} token={token} />
      ))}
    </div>
  );
}
