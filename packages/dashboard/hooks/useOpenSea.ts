'use client';

import { OpenSeaCollectionStats } from '@/types/opensea';
import { useQueries } from '@tanstack/react-query';

async function getFloorPrice(slug: string): Promise<number | null> {
  const res = await fetch('/api/opensea/collectionStats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) throw new Error(`Failed to fetch floor price for ${slug}`);

  const data: OpenSeaCollectionStats = await res.json();

  return data.total.floor_price ?? null;
}

export function useFloorPrices(slugs: string[]) {
  const queries = useQueries({
    queries: slugs.map(slug => ({
      queryKey: ['floorPrice', slug],
      queryFn: () => getFloorPrice(slug),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  });

  return Object.fromEntries(slugs.map((slug, i) => [slug, queries[i].data ?? null]));
}
