/**
 * Displays an icon for a token or asset with fallback to symbol text
 */
export function AssetIcon({
  logoURI,
  symbol,
  size = 'default',
  className = '',
}: {
  logoURI?: string;
  symbol: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const sizeClass = sizeClasses[size];

  return logoURI ? (
    <img
      src={logoURI}
      alt={symbol}
      className={`${sizeClass} rounded-full object-cover ${className}`}
    />
  ) : (
    <div
      className={`${sizeClass} bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium ${className}`}>
      {symbol.slice(0, 1)}
    </div>
  );
}
