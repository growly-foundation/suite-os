import { SignJWT } from 'jose';

/**
 * Generate a JWT token for Intercom authentication
 * This provides secure user identification for Intercom
 */
export async function generateIntercomJWT(
  userId: string,
  userEmail: string,
  userName: string
): Promise<string> {
  const secret = process.env.NEXT_PUBLIC_INTERCOM_CLIENT_SECRET;

  if (!secret) {
    throw new Error('NEXT_PUBLIC_INTERCOM_CLIENT_SECRET environment variable is not set');
  }

  // Create JWT payload with user information
  const payload = {
    user_id: userId,
    email: userEmail,
    name: userName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
  };

  try {
    // Create JWT using jose library
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(secret));

    return jwt;
  } catch (error) {
    console.error('Error generating Intercom JWT:', error);
    throw new Error('Failed to generate Intercom JWT');
  }
}

/**
 * Validate that required Intercom environment variables are set
 */
export function validateIntercomConfig(): boolean {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
  const clientSecret = process.env.NEXT_PUBLIC_INTERCOM_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    console.warn('Intercom configuration incomplete. Missing required environment variables.');
    return false;
  }

  return true;
}
