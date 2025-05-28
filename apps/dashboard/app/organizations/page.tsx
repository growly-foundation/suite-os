import { OrganizationSelector } from '@/components/organizations/organization-selector';
import ProtectedAuthProvider from '@/components/providers/protected-auth-provider';

export default function OrganizationPage() {
  return (
    <ProtectedAuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-3xl">
          <OrganizationSelector />
        </div>
      </main>
    </ProtectedAuthProvider>
  );
}
