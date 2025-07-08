'use server';

import { PrivyUser } from '@/lib/services/privy.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyUser } = body as { privyUser: PrivyUser };

    if (!privyUser) {
      return NextResponse.json({ error: 'Missing privyUser in request body' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: privyUser,
    });
  } catch (error) {
    console.error('Error importing Privy user:', error);
    return NextResponse.json(
      {
        error: 'Failed to import user',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
