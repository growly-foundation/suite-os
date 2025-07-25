import { useCallback, useState } from 'react';

import { validateIntercomConfig } from '../utils/intercom-jwt';

interface UseIntercomJWTProps {
  userId: string;
  userEmail: string;
  userName: string;
}

export function useIntercomJWT({ userId, userEmail, userName }: UseIntercomJWTProps) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJWT = useCallback(async () => {
    // Check if Intercom is properly configured
    if (!validateIntercomConfig()) {
      setError('Intercom configuration incomplete');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/intercom/jwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate JWT');
      }

      const data = await response.json();
      setJwt(data.jwt);
      return data.jwt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate JWT';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, userEmail, userName]);

  const clearJWT = useCallback(() => {
    setJwt(null);
    setError(null);
  }, []);

  return {
    jwt,
    isLoading,
    error,
    fetchJWT,
    clearJWT,
  };
}
