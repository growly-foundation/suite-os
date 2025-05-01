import { CafeFGoldPrice } from '@/types/cafef';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index');

  if (!index) {
    return NextResponse.json({ error: 'Missing index parameter' }, { status: 400 });
  }

  // Validate index should be: 1w, 2w, 1m, 3m, 6m, 1y, all
  if (!index || !['1w', '2w', '1m', '3m', '6m', '1y', 'all'].includes(index)) {
    return NextResponse.json({ error: 'Invalid index parameter' }, { status: 400 });
  }

  try {
    const res = await axios.get<{
      Data: CafeFGoldPrice;
      Message: string | null;
      Success: boolean;
    }>(`https://cafef.vn/du-lieu/Ajax/ajaxgoldpricehistory.ashx?index=${index}`);
    const data = res.data.Data;

    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('CafeF Gold fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch gold data' }, { status: 500 });
  }
}
