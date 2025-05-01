import { CafeFExchangeRate, CafeFGoldPrice, CafeFInterestRate } from '@/types/cafef';
import { useQuery } from '@tanstack/react-query';

export function useSavingRates() {
  return useQuery({
    queryKey: ['saving-rates'],
    queryFn: async () => {
      const res = await fetch('/api/cafef/savings');

      if (!res.ok) throw new Error('Failed to fetch saving rates');
      const data: CafeFInterestRate[] = await res.json();
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const res = await fetch('/api/cafef/exchange');

      if (!res.ok) throw new Error('Failed to fetch exchange rates');
      const data: CafeFExchangeRate[] = await res.json();
      console.log(data);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

async function getGoldPriceByIndex(index: string): Promise<CafeFGoldPrice | null> {
  const res = await fetch('/api/cafef/gold?index=' + index, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error(`Failed to fetch gold price for ${index}`);

  const data: CafeFGoldPrice = await res.json();

  return data;
}

export function useGoldPrice(index: string) {
  return useQuery({
    queryKey: ['gold', index],
    queryFn: async () => {
      return getGoldPriceByIndex(index);
    },
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}
