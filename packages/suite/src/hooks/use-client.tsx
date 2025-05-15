import { useEffect, useState } from 'react';

/**
 * A safe hook to check if the code is running on the browser client.
 * Returns true only after the component is mounted on the client.
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
