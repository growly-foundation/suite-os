import { CafeFExchangeRate } from '@/types/cafef';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

export async function GET() {
  const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'dd/MM/yyyy');

  try {
    const res = await axios.get<{
      Data: CafeFExchangeRate[];
      Message: string | null;
      Success: boolean;
    }>(`https://cafef.vn/du-lieu/ajax/exchangerate/ajaxratecurrency.ashx?time=${yesterday}`);
    const data = res.data.Data;

    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('CafeF Exchange Rate fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
  }
}
