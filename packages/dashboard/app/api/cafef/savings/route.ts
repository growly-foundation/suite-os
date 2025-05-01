import { CafeFInterestRate } from '@/types/cafef';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await axios.get<{
      Data: CafeFInterestRate[];
      Message: string | null;
      Success: boolean;
    }>('https://cafef.vn/du-lieu/ajax/ajaxlaisuatnganhang.ashx');
    const data = res.data.Data;

    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('CafeF Interest Rate fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch saving rates' }, { status: 500 });
  }
}
