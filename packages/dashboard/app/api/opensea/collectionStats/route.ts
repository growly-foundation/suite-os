// app/api/opensea/floor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { OpenSeaCollectionStats } from '@/types/opensea';

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

export async function POST(req: NextRequest) {
  const { slug } = await req.json();

  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  try {
    const { data } = await axios.get<OpenSeaCollectionStats>(
      `https://api.opensea.io/api/v2/collections/${slug}/stats`,
      {
        headers: {
          'x-api-key': OPENSEA_API_KEY || '',
        },
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('OpenSea fetch error:', error);
    return NextResponse.json({ slug, floorPrice: null }, { status: 500 });
  }
}
