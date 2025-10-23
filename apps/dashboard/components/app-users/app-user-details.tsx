import { useDashboardState } from '@/hooks/use-dashboard';
import { useWalletData } from '@/hooks/use-wallet-data';
import { getTraitColor } from '@/lib/color.utils';
import { formatAssetValue } from '@/lib/number.utils';
import { cn } from '@/lib/utils';
import { PersonaTrait } from '@/types/persona';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Trophy, Wallet } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { UserProfileHeader } from '../user/user-profile-header';
import { UserStats } from '../user/user-stats';
import { ActivityFeed } from './activity-feed';
import { PortfolioNftTable } from './portfolio-nft-table';
import { PortfolioTokenTable } from './portfolio-token-table';

interface UserDetailsProps {
  userId: string;
}

export function UserDetails({ userId }: UserDetailsProps) {
  const { fetchUserById } = useDashboardState();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  // Use optimized wallet data hook when user is available
  const walletData = useWalletData(user || ({} as any));

  // Use wallet data from API instead of persona calculations
  const totalValue = walletData.fungibleTotalUsd;

  const dominantTrait: PersonaTrait =
    walletData.personaAnalysis?.dominantTrait || PersonaTrait.NEWBIE;

  if (isLoading) {
    // Default skeleton configuration
    return generateSkeleton({
      showStats: true,
      showBadges: true,
      showTokens: true,
      showNfts: true,
      showActivity: true,
      statCardsCount: 3,
      badgesCount: 6, // Default to 6 badges while loading
      tokenRowsCount: 3,
      nftRowsCount: 3,
      activityRowsCount: 4,
    });
  }
  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen w-full">
      <div className="relative container mx-auto px-6 py-4">
        <UserProfileHeader user={user} />
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Badge className={cn(getTraitColor(dominantTrait as PersonaTrait), 'rounded-full')}>
              {dominantTrait}
            </Badge>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            {/* Activity Stats with Better Design */}
            <div className="overflow-hidden">
              <div>
                <h2 className="text-md font-bold text-gray-900">Activity Stats</h2>
                <p className="text-sm text-gray-600">Your on-chain activity metrics</p>
              </div>
              <div className="py-6">
                {/* Portfolio Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-md">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          ${formatAssetValue(totalValue || 0)}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Total Value</h3>
                    <p className="text-xs text-gray-600">Portfolio performance</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-100 rounded-md">
                        <Wallet className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {formatAssetValue(walletData.fungiblePositions?.length || 0)}
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Active</div>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Tokens</h3>
                    <p className="text-xs text-gray-600">Different assets held</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-100 rounded-md">
                        <Trophy className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {(
                            user.personaData?.identities?.traitScores?.length ?? 0
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Earned</div>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Badges</h3>
                    <p className="text-xs text-gray-600">Reputation earned</p>
                  </div>
                </div>
                <div className="mt-4">
                  <UserStats walletData={walletData} />
                </div>
              </div>
            </div>

            <Separator className="my-4 border-gray-100" />

            {/* Token Holdings Table */}
            <div className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-md font-bold text-gray-900">Token Holdings</h2>
                  <p className="text-sm text-gray-600">User's current portfolio assets</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {(walletData.fungiblePositions?.length ?? 0).toLocaleString()} tokens
                  </div>
                </div>
              </div>
              <div className="py-6 max-h-[600px] overflow-y-auto scrollbar-hidden">
                <PortfolioTokenTable walletData={walletData} />
              </div>
            </div>

            <Separator className="my-4 border-gray-100" />

            {/* NFT Holdings Table */}
            <div className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-md font-bold text-gray-900">NFT Holdings</h2>
                  <p className="text-sm text-gray-600">User's digital collectibles</p>
                </div>
                <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  {(walletData.nftPositions?.length ?? 0).toLocaleString()} items
                </div>
              </div>
              <div className="py-6 max-h-[600px] overflow-y-auto scrollbar-hidden">
                <PortfolioNftTable walletData={walletData} />
              </div>
            </div>
          </div>

          {/* Activity & Social */}
          <div className="space-y-4">
            {/* Activity Feed with Enhanced Design */}
            <div className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-md font-bold text-gray-900">Recent Activity (90d)</h2>
                  <p className="text-sm text-gray-600">User's latest transactions</p>
                </div>
              </div>
              <div className="py-6">
                <ActivityFeed walletData={walletData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonOptions {
  showStats?: boolean;
  showBadges?: boolean;
  showTokens?: boolean;
  showNfts?: boolean;
  showActivity?: boolean;
  statCardsCount?: number;
  badgesCount?: number;
  tokenRowsCount?: number;
  nftRowsCount?: number;
  activityRowsCount?: number;
}

const generateSkeleton = ({
  statCardsCount = 3,
  badgesCount = 6,
  tokenRowsCount = 3,
  nftRowsCount = 3,
  activityRowsCount = 4,
}: SkeletonOptions) => {
  return (
    <div className="min-h-screen w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="relative container mx-auto px-6 py-4">
        <div className="h-24 bg-muted rounded-lg" />
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Activity Stats Skeleton */}
          <div className="space-y-4">
            <div className="overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg w-10 h-10" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: statCardsCount }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-muted rounded-md w-12 h-12" />
                        <div className="space-y-2">
                          <div className="h-6 w-24 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Badges Skeleton */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-muted rounded-lg w-10 h-10" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: badgesCount }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>

          {/* Token Holdings Skeleton */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-muted rounded-lg w-10 h-10" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: tokenRowsCount }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>

          {/* NFT Holdings Skeleton */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-muted rounded-lg w-10 h-10" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: nftRowsCount }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>

          {/* Activity Feed Skeleton */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-muted rounded-lg w-10 h-10" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: activityRowsCount || 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
