'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2 } from 'lucide-react';

/**
 * Renders a login form with a sign-in button and authentication state handling.
 *
 * Displays a welcome message, an image, and a button that initiates the login process and user creation if needed. The button is disabled until the authentication system is ready or if the user is already signed in. Includes links to Terms of Service and Privacy Policy.
 */
export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { login, authenticated, ready } = usePrivy();

  return (
    <div className={cn('flex flex-col gap-6 items-center justify-center', className)} {...props}>
      <Card className="overflow-hidden max-w-[400px]" style={{ borderRadius: '20px' }}>
        <CardContent className="p-0 px-5 shadow-2xl">
          <div className="flex flex-col justify-center items-center p-6 md:p-8 min-h-[300px] gap-6">
            <div className="flex flex-col gap-2 items-center text-center">
              <img src="/logos/suite-logo.png" alt="Suite" className="w-10 h-10 my-2" />
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Start growing your business with Suite
              </h1>
              <p className="text-balance text-sm text-muted-foreground">
                Create or log in to the dashboard to track user insights with Suite Widget and
                support users with Suite AI agents.
              </p>
            </div>
            <Button
              onClick={async () => {
                await login({});
              }}
              className="w-full"
              disabled={!ready || authenticated}>
              {!ready ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ''}
              {!ready ? 'Loading' : authenticated ? 'Signed in' : 'Sign in to dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
