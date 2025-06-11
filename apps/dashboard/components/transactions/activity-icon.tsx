export const getActivityColor = (type: string) => {
  switch (type) {
    case 'send':
      return 'bg-red-100 text-red-600';
    case 'receive':
      return 'bg-green-100 text-green-600';
    case 'vote':
      return 'bg-blue-100 text-blue-600';
    default:
      return 'bg-purple-100 text-purple-600';
  }
};

export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'send':
      return '↗';
    case 'receive':
      return '↙';
    case 'vote':
      return '🗳';
    default:
      return '↔';
  }
};

export const ActivityIcon = ({ type }: { type: string }) => {
  return (
    <div
      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${getActivityColor(type)}`}>
      {getActivityIcon(type)}
    </div>
  );
};
