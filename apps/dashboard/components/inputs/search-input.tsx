import { Search } from 'lucide-react';

import { Input } from '../ui/input';

export const SearchInput = ({
  className,
  searchQuery,
  placeholder,
  setSearchQuery,
}: {
  className?: string;
  searchQuery: string;
  placeholder?: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8 text-sm border-none"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};
