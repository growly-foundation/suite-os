import { consumePersona } from '@/core/persona';
import { Activity, BarChart3, ImageIcon, Sparkles, TrendingUp, Trophy, Wallet } from 'lucide-react';
import { useMemo } from 'react';

import { TMarketNft, TMarketToken } from '@getgrowly/chainsmith/types';
import { ParsedUser } from '@getgrowly/core';

import { Separator } from '../ui/separator';
import { UserProfileHeader } from '../user/user-profile-header';
import { UserStats } from '../user/user-stats';
import { ActivityFeed } from './activity-feed';
import { UserBadges } from './app-user-badges';
import { PortfolioNftTable } from './portfolio-nft-table';
import { PortfolioTokenTable } from './portfolio-token-table';

interface UserDetailsProps {
  user: ParsedUser;
}

export function UserDetails({ user }: UserDetailsProps) {
  const userPersona = consumePersona(user);

  const totalTokenValue = useMemo(() => {
    return userPersona
      .universalTokenList()
      .reduce(
        (sum: number, token: TMarketToken) => sum + (token.marketPrice || 0) * (token.balance || 0),
        0
      );
  }, [userPersona]);

  const totalNftValue = useMemo(() => {
    return userPersona
      .universalNftList()
      .reduce((sum: number, nft: TMarketNft) => sum + (nft.usdValue || 0), 0);
  }, [userPersona]);
  return (
    <div className="min-h-screen w-full">
      <div className="relative container mx-auto px-6 py-4">
        <UserProfileHeader user={user} />
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            {/* Activity Stats with Better Design */}
            <div className="overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-md font-bold text-gray-900">Activity Stats</h2>
                  <p className="text-sm text-gray-600">Your on-chain activity metrics</p>
                </div>
              </div>
              <div className="py-6">
                {/* Portfolio Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${(totalTokenValue + totalNftValue).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-md font-semibold text-gray-900 mb-1">Total Value</h3>
                    <p className="text-sm text-gray-600">Portfolio performance</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Wallet className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {userPersona.universalTokenList().length}
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Active</div>
                      </div>
                    </div>
                    <h3 className="text-md font-semibold text-gray-900 mb-1">Tokens</h3>
                    <p className="text-sm text-gray-600">Different assets held</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Trophy className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {user.personaData.identities.traitScores?.length || 0}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Earned</div>
                      </div>
                    </div>
                    <h3 className="text-md font-semibold text-gray-900 mb-1">Badges</h3>
                    <p className="text-sm text-gray-600">Reputation earned</p>
                  </div>
                </div>
                <div className="mt-4">
                  <UserStats user={user} />
                </div>
              </div>
            </div>

            <Separator className="my-4 border-gray-100" />

            {/* Reputation Badges with Enhanced Display */}
            <div className="overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-md font-bold text-gray-900">Reputation Badges</h2>
                  <p className="text-sm text-gray-600">Your earned achievements</p>
                </div>
              </div>
              <div className="py-6">
                <UserBadges
                  showAll
                  badges={
                    user.personaData.identities.traitScores
                      ?.sort((a, b) => b.score - a.score)
                      .map(traitScore => traitScore.trait.toString()) || []
                  }
                />
              </div>
            </div>

            <Separator className="my-4 border-gray-100" />

            {/* Token Holdings Table */}
            <div className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-gray-900">Token Holdings</h2>
                    <p className="text-sm text-gray-600">Your current portfolio assets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {userPersona.universalTokenList().length} tokens
                  </div>
                </div>
              </div>
              <div className="py-6 max-h-[600px] overflow-y-auto">
                <PortfolioTokenTable userPersona={userPersona} />
              </div>
            </div>

            <Separator className="my-4 border-gray-100" />

            {/* NFT Holdings Table */}
            <div className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-gray-900">NFT Holdings</h2>
                    <p className="text-sm text-gray-600">Your digital collectibles</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  {userPersona.universalNftList().length} items
                </div>
              </div>
              <div className="py-6 max-h-[600px] overflow-y-auto">
                <PortfolioNftTable userPersona={userPersona} />
              </div>
            </div>
          </div>

          {/* Activity & Social */}
          <div className="space-y-4">
            {/* Activity Feed with Enhanced Design */}
            <div className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-gray-900">Recent Activity</h2>
                    <p className="text-sm text-gray-600">Your latest transactions</p>
                  </div>
                </div>
              </div>
              <div className="py-6">
                <ActivityFeed user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
