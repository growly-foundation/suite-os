import { CoingeckoMarket } from '@/types/coingecko';
import { useQuery } from '@tanstack/react-query';

export function useCryptoMarkets() {
  return useQuery({
    queryKey: ['coingecko-markets'],
    queryFn: async () => {
      const res = await fetch('/api/coingecko/market');
      if (!res.ok) throw new Error('Failed to fetch crypto market data');
      const data: CoingeckoMarket[] = await res.json();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
