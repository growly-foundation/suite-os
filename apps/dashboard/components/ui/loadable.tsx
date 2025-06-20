import { Loader2Icon } from 'lucide-react';

export const Loadable = ({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) => {
  return (
    <>
      {loading ? <Loader2Icon className="h-3 w-3 animate-spin text-muted-foreground" /> : children}
    </>
  );
};
