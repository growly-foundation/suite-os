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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2 shadow-2xl">
          <img
            src="/banners/growly-suite-signin.png"
            alt="Image"
            style={{ width: 500, height: 500 }}
            className="object-cover dark:brightness-[0.2] dark:grayscale"
          />
          <div className="flex flex-col justify-center items-center p-6 md:p-8 min-h-[500px] gap-6">
            <div className="flex flex-col gap-2 items-center text-center">
              <h1 className="text-2xl font-bold">Welcome to Growly!</h1>
              <p className="text-balance text-muted-foreground">Sign in to Suite your account.</p>
            </div>
            <Button
              onClick={async () => {
                await login({});
              }}
              className="w-full"
              disabled={!ready || authenticated}>
              {!ready ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ''}
              {!ready ? 'Loading' : authenticated ? 'Signed in' : 'Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
