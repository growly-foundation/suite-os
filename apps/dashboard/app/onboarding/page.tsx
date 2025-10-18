'use client';

import { useAuth } from '@/components/providers/protected-auth-provider';
import { Button } from '@/components/ui/button';
import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AnimatedBusterLoading } from '@getgrowly/ui';

export default function OnboardingRedirect() {
  const router = useRouter();
  const { fetchCurrentAdmin } = useAuth();
  const { authenticated, ready, user, logout } = usePrivy();
  const { fetchOrganizations } = useDashboardState();
  const [hasOrganizations, setHasOrganizations] = useState(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (ready && authenticated) {
        if (!user?.email) {
          router.push('/auth');
          return;
        }
        const admin = await fetchCurrentAdmin(user.email.address);
        if (!admin || !admin.name || admin.name.startsWith('user-')) {
          // If the admin doesn't have profile info filled out
          router.push('/onboarding/profile');
        } else {
          // Check if admin has organizations in the next step
          router.push('/dashboard');
        }
      } else if (ready && !authenticated) {
        router.push('/auth');
      }
    }
    checkOnboarding();
  }, [ready, authenticated, user, router]);

  useEffect(() => {
    const checkOrganizations = async () => {
      setIsLoadingOrganizations(true);
      try {
        const orgs = await fetchOrganizations();
        setHasOrganizations(orgs.length > 0);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };
    checkOrganizations();
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 relative">
      {/* Action buttons in top-right corner */}
      <div className="absolute top-4 right-4 flex gap-2">
        {!isLoadingOrganizations && hasOrganizations && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await logout();
            router.push('/auth');
          }}
          className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="w-full max-w-sm md:max-w-3xl relative">
        <div className="animate-pulse my-12 z-10 relative">
          <div className="flex items-center justify-center">
            <AnimatedBusterLoading width={120} height={120} />
            <div className="text-left" style={{ marginLeft: '20px' }}>
              <h2 className="text-2xl font-semibold">Setting up your account...</h2>
              <p className="text-muted-foreground mt-2">
                Just a moment while we prepare your experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
