import { NextRequest, NextResponse } from 'next/server';

import { generateIntercomJWT, validateIntercomConfig } from '../../../../utils/intercom-jwt';

export async function POST(request: NextRequest) {
  try {
    // Validate Intercom configuration
    if (!validateIntercomConfig()) {
      return NextResponse.json({ error: 'Intercom configuration incomplete' }, { status: 500 });
    }

    // Parse request body
    const body = await request.json();
    const { userId, userEmail, userName } = body;

    // Validate required fields
    if (!userId || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userEmail, userName' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const jwt = await generateIntercomJWT(userId, userEmail, userName);

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error('Error generating Intercom JWT:', error);
    return NextResponse.json({ error: 'Failed to generate JWT token' }, { status: 500 });
  }
}
