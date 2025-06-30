import ProtectedAuthProvider from '@/components/providers/protected-auth-provider';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedAuthProvider>{children}</ProtectedAuthProvider>;
}
