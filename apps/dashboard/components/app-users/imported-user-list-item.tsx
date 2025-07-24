import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { ImportUserOutput } from '@getgrowly/core';
import { RandomAvatar, WalletAddress } from '@getgrowly/ui';

interface ImportedUserListItemProps {
  user: ImportUserOutput;
  selected: boolean;
  onUserSelect?: (user: ImportUserOutput) => void;
  renderAdditionalInfo?: (user: ImportUserOutput) => React.ReactNode;
}

export const ImportedUserListItem = ({
  user,
  selected,
  onUserSelect,
  renderAdditionalInfo,
}: ImportedUserListItemProps) => {
  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-muted">
      <Checkbox
        id={`user-${user.walletAddress}`}
        className="border-gray-450"
        checked={selected}
        onCheckedChange={() => onUserSelect?.(user)}
      />
      <Label
        htmlFor={`user-${user.walletAddress}`}
        className="flex-1 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <RandomAvatar address={user.walletAddress! as any} size={30} />
          <WalletAddress address={user.walletAddress!} />
        </div>
        <div className="flex items-center space-x-2">
          {renderAdditionalInfo && renderAdditionalInfo(user)}
        </div>
      </Label>
    </div>
  );
};
