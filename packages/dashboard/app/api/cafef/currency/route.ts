import { CafeFExchangeRate } from '@/types/cafef';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const currency = searchParams.get('currency');

  if (!date) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
  }

  // Validate date should be: 1w, 2w, 1m, 3m, 6m, 1y, all
  if (!date || !['1w', '1m', '3m', '6m', '1y'].includes(date)) {
    return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
  }

  try {
    const res = await axios.get<{
      Data: CafeFExchangeRate[];
      Message: string | null;
      Success: boolean;
    }>(
      `https://cafef.vn/du-lieu/ajax/exchangerate/AjaxRateCurrencyByNameAndDate.ashx?name=${currency}&date=${date}`
    );
    const data = res.data.Data;

    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('CafeF currency fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch currency data' }, { status: 500 });
  }
}
