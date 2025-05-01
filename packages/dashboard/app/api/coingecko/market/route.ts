import { CoingeckoMarket } from '@/types/coingecko';
import axios from 'axios';
import { NextResponse } from 'next/server';

const COINGECKO_PUBLIC_API_KEY = process.env.COINGECKO_PUBLIC_API_KEY;

export async function GET() {
  const queryOptions = {
    vs_currency: 'usd',
    order: 'desc',
    per_page: '250',
    sparkline: 'true',
  };

  const queryString = new URLSearchParams(queryOptions).toString();

  try {
    const { data } = await axios.get<CoingeckoMarket>(
      `https://api.coingecko.com/api/v3/coins/markets?${queryString}`,
      {
        headers: {
          'x-cg-demo-api-key': COINGECKO_PUBLIC_API_KEY || '',
        },
      }
    );

    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Coingecko fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto market data' }, { status: 500 });
  }
}
