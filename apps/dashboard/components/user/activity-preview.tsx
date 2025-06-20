import { formatDate } from '@/lib/string.utils';
import { formatUnits } from 'viem';

import { truncateAddress } from '@getgrowly/ui';

import { ActivityIcon, TxActivityType } from '../transactions/activity-icon';

export interface ActivityData {
  from: string;
  to: string;
  value: string | number;
  symbol: string;
  tokenDecimal?: string;
  timestamp: string | number;
}

interface ActivityPreviewProps {
  activity: ActivityData;
  userId: string;
  variant?: 'compact' | 'expanded';
}

/**
 * Reusable component for displaying transaction activity
 */
export function ActivityPreview({ activity, userId, variant = 'expanded' }: ActivityPreviewProps) {
  const isOutgoing = activity.from === userId;
  const formattedValue = parseFloat(
    formatUnits(BigInt(activity.value.toString()), parseInt(activity.tokenDecimal || '18'))
  ).toFixed(2);

  const activityType = isOutgoing ? TxActivityType.Send : TxActivityType.Receive;

  return (
    <div className="flex items-start gap-3">
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
          isOutgoing ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
        <ActivityIcon type={activityType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          {isOutgoing
            ? `Sent ${formattedValue} ${activity.symbol} to ${truncateAddress(activity.to)}`
            : `Received ${formattedValue} ${activity.symbol} from ${truncateAddress(activity.from)}`}
        </p>
        {variant === 'expanded' && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {formatDate(
                new Date(parseInt(activity.timestamp.toString()) * 1000).toLocaleDateString()
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
