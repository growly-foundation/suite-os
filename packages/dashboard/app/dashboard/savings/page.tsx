'use client';

import { useSavingRates, useExchangeRates } from '@/hooks/useCafeF';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table';
import { columns } from './savings-rate-columns';
import { columns as exchangeRateColumns } from './exchange-rate-columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SavingsPage() {
  const { data, isLoading, isError } = useSavingRates();
  const {
    data: exchangeRates,
    isLoading: exchangeRatesLoading,
    isError: exchangeRatesError,
  } = useExchangeRates();

  console.log(exchangeRates);

  if (isLoading || exchangeRatesLoading) return <p className="p-6">Loading...</p>;
  if (isError || exchangeRatesError || !data || !exchangeRates)
    return <p className="p-6">Failed to load data</p>;

  const pivotData = data.map(bank => {
    return {
      id: bank.id,
      name: bank.name,
      icon: bank.icon,
      ...bank.interestRates.reduce(
        (acc, r) => {
          acc[`${r.deposit}m`] = r.value ?? 0;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Interest Rate Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="saving-rates" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="saving-rates">Saving Rates</TabsTrigger>
              <TabsTrigger value="exchange-rates">Exchange Rates</TabsTrigger>
            </TabsList>
            <TabsContent value="saving-rates">
              <DataTable columns={columns} data={pivotData} />
            </TabsContent>
            <TabsContent value="exchange-rates">
              <DataTable columns={exchangeRateColumns} data={exchangeRates} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
