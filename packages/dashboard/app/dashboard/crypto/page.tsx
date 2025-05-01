'use client';

import { DataTable } from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCryptoMarkets } from '@/hooks/useCoingeko';
import { columns } from './columns';

export default function CryptoPage() {
  const { data, isLoading, isError } = useCryptoMarkets();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6">Failed to load crypto market data.</div>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Crypto Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
