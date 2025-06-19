export enum TxActivityType {
  Send = 'send',
  Receive = 'receive',
}

export const getActivityColor = (type: TxActivityType) => {
  switch (type) {
    case TxActivityType.Send:
      return 'bg-red-100 text-red-600';
    case TxActivityType.Receive:
      return 'bg-green-100 text-green-600';
    default:
      return 'bg-purple-100 text-purple-600';
  }
};

export const getActivityIcon = (type: TxActivityType) => {
  switch (type) {
    case TxActivityType.Send:
      return '↗';
    case TxActivityType.Receive:
      return '↙';
    default:
      return '↔';
  }
};

export const ActivityIcon = ({ type }: { type: TxActivityType }) => {
  return (
    <div
      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${getActivityColor(type)}`}>
      {getActivityIcon(type)}
    </div>
  );
};
