import { ActivityIcon, TxActivityType } from '@/components/transactions/activity-icon';
import { formatUnits } from 'viem';

export interface ActivityData {
  from: string;
  to: string;
  value: string | number;
  symbol: string;
  tokenDecimal?: string;
  timestamp: string | number;
  operationType?: string;
  isNFT?: boolean;
  image?: string;
  tokenId?: string;
}

interface ActivityPreviewProps {
  activity: ActivityData;
  userId: string;
}

function shorten(addr?: string) {
  if (!addr) return '';
  if (addr.startsWith('0x') && addr.length > 10) return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  return addr;
}

export function ActivityPreview({ activity, userId }: ActivityPreviewProps) {
  const isOutgoing = activity.from?.toLowerCase() === userId?.toLowerCase();
  const decimals = parseInt(activity.tokenDecimal || '18');
  console.log(activity);

  let formattedValue = '0.00';
  const raw = activity.value;
  if (typeof raw === 'string' && /^\d+$/.test(raw)) {
    formattedValue = parseFloat(formatUnits(BigInt(raw), decimals)).toFixed(4);
  } else if (typeof raw === 'number') {
    formattedValue = Number(raw).toFixed(4);
  } else {
    const n = Number(String(raw));
    formattedValue = isNaN(n) ? '0.00' : n.toFixed(4);
  }

  const mapOperationToType = (op?: string): TxActivityType => {
    switch (op) {
      case 'send':
      case 'withdraw':
        return TxActivityType.Send;
      case 'receive':
      case 'deposit':
      case 'mint':
      case 'airdrop':
        return TxActivityType.Receive;
      case 'swap':
      default:
        return isOutgoing ? TxActivityType.Send : TxActivityType.Receive;
    }
  };

  const formatMessage = (op?: string): string => {
    if (activity.isNFT) {
      switch (op) {
        case 'send':
        case 'withdraw':
          return `Sent NFT ${activity.symbol} #${activity.tokenId} to ${shorten(activity.to)}`;
        case 'receive':
        case 'deposit':
        case 'mint':
        case 'airdrop':
          return `Received NFT ${activity.symbol} #${activity.tokenId} from ${shorten(activity.from)}`;
        default:
          return `${isOutgoing ? 'Sent' : 'Received'} NFT ${activity.symbol} #${activity.tokenId}`;
      }
    }
    switch (op) {
      case 'send':
      case 'withdraw':
        return `Sent ${formattedValue} ${activity.symbol} to ${shorten(activity.to)}`;
      case 'receive':
      case 'deposit':
      case 'mint':
      case 'airdrop':
        return `Received ${formattedValue} ${activity.symbol} from ${shorten(activity.from)}`;
      case 'swap':
        return `Swapped ~${formattedValue} ${activity.symbol}`;
      default:
        return `${isOutgoing ? 'Sent' : 'Received'} ${formattedValue} ${activity.symbol}`;
    }
  };

  const activityType = mapOperationToType(activity.operationType);
  const message = formatMessage(activity.operationType);

  return (
    <div className="flex items-start gap-3">
      {activity.isNFT && activity.image ? (
        <img src={activity.image} alt={activity.symbol} className="w-6 h-6 rounded" />
      ) : (
        <div
          className={`rounded-full flex items-center justify-center text-xs`}
          style={{ width: 20, height: 20 }}>
          <ActivityIcon type={activityType} />
        </div>
      )}
      <div className="flex flex-col text-xs">
        <div className="truncate max-w-[420px]">{message}</div>
      </div>
    </div>
  );
}
