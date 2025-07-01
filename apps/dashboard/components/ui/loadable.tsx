import { Loader2Icon } from 'lucide-react';

export const Loadable = ({
  children,
  loading,
  fallback,
}: {
  children: React.ReactNode;
  loading: boolean;
  fallback?: React.ReactNode;
}) => {
  return (
    <>
      {loading
        ? fallback || <Loader2Icon className="h-3 w-3 animate-spin text-muted-foreground" />
        : children}
    </>
  );
};
