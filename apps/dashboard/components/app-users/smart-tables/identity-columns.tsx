import { cn } from '@/lib/utils';
import { UserIcon } from 'lucide-react';
import { Address } from 'viem';

import { WalletAddress } from '@getgrowly/ui';

import { Checkbox } from '../../ui/checkbox';
import { AppUserAvatarWithStatus } from '../app-user-avatar-with-status';
import { ColumnType, TableColumn } from '../types';
import { HeadLabelWithIcon } from './table-head-label';

export function createIdentityColumns<
  T extends {
    id: string;
    name?: string | undefined | null;
    walletAddress: string;
    truncateWalletAddress?: boolean;
  },
>({
  item,
  onCheckboxChange,
  onSelectAll,
  onUserClick,
  selectedUsers,
}: {
  item: T;
  onUserClick?: (user: T) => void;
  onCheckboxChange: (userId: string, checked: boolean) => void;
  selectedUsers: Record<string, boolean>;
  onSelectAll: (checked: boolean) => void;
}): TableColumn<T>[] {
  return [
    {
      key: 'identity',
      sortable: false,
      header: (
        <div className="flex items-center space-x-4 h-12 border-r">
          <Checkbox
            className="border-gray-450"
            checked={Object.values(selectedUsers).some(Boolean)}
            onCheckedChange={onSelectAll}
          />
          <HeadLabelWithIcon
            icon={<UserIcon className="h-3 w-3 text-muted-foreground" />}
            label="User"
          />
        </div>
      ),
      type: ColumnType.OBJECT,
      sticky: true,
      border: false,
      className: 'sticky py-0 left-0 bg-white box-shadow shadow-sm z-10',
      dataExtractor: () => item,
      contentRenderer: () => {
        const walletAddress = item.walletAddress;
        const name = item.name;
        const id = item.id;
        return (
          <div className="flex items-center space-x-4 h-12 border-r">
            <Checkbox
              className="border-gray-450"
              checked={!!selectedUsers[id]}
              onCheckedChange={checked => onCheckboxChange(id, !!checked)}
            />
            <div className="flex items-center text-sm space-x-3 pr-4">
              <AppUserAvatarWithStatus
                walletAddress={walletAddress as Address}
                name={name || ''}
                size={25}
              />
              <div>
                <h3 className="font-bold text-xs">{name}</h3>
                <WalletAddress
                  className={cn('text-xs', onUserClick && 'hover:underline')}
                  truncate={!!item.truncateWalletAddress}
                  truncateLength={{ startLength: 12, endLength: 4 }}
                  address={walletAddress}
                  onClick={e => {
                    e.stopPropagation();
                    onUserClick?.(item);
                  }}
                />
              </div>
            </div>
          </div>
        );
      },
    },
  ];
}
