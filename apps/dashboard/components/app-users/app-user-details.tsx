import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatNumber } from '@/lib/string.utils';
import {
  Activity,
  Award,
  ExternalLink,
  ImageIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import React from 'react';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { ActivityIcon } from '../transactions/activity-icon';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';

interface UserDetailsProps {
  user: ParsedUser;
}

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <React.Fragment>
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center p-6 border-b bg-white">
        <AppUserAvatarWithStatus user={user} size={80} />
        <h3 className="font-semibold text-lg">{user.ensName}</h3>
        <div className="flex items-center gap-2 mt-1">
          <WalletAddress truncate address={user.address} />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-sm text-center text-muted-foreground mt-2">{user.description}</p>

        {/* Reputation */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Award className="h-3 w-3 mr-1" />
            {user.reputation.level} • {user.reputation.score}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Stats Overview */}
        <div className="p-4 bg-white border-b">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Stats
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Transactions</p>
              <p className="font-medium">{formatNumber(user.stats.totalTransactions)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Volume</p>
              <p className="font-medium">{formatNumber(user.stats.totalVolume)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">NFTs</p>
              <p className="font-medium">{formatNumber(user.stats.nftCount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Days Active</p>
              <p className="font-medium">{formatNumber(user.stats.daysActive)}</p>
            </div>
          </div>
        </div>

        {/* Top Tokens */}
        <div className="p-4 bg-white border-b">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Top Holdings
          </h4>
          <div className="space-y-3">
            {user.tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">
                    {token.symbol}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {token.balance} {token.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatNumber(token.value)}</p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {token.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(token.change24h).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 bg-white border-b">
          <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {user.recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                    activity.type === 'send'
                      ? 'bg-red-100 text-red-600'
                      : activity.type === 'receive'
                        ? 'bg-green-100 text-green-600'
                        : activity.type === 'vote'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                  }`}>
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </p>
                    {activity.value && (
                      <p className="text-xs font-medium">{formatNumber(activity.value)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NFT Collection */}
        <div className="p-4 bg-white border-b">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Featured NFTs
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {user.nfts.slice(0, 6).map((nft, index) => (
              <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={nft.image || '/placeholder.svg'}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reputation Badges */}
        <div className="p-4 bg-white">
          <h4 className="text-sm font-semibold mb-3">Reputation Badges</h4>
          <div className="flex flex-wrap gap-2">
            {user.reputation.badges.map((badge, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
