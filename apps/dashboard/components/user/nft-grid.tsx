/**
 * Interface for NFT item data
 */
export interface NftItemData {
  id?: string;
  name: string;
  imageUrl?: string;
}

interface NftGridProps {
  items: NftItemData[];
  limit?: number;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * Displays a grid of NFT items
 */
export function NftGrid({ items, limit = 6, columns = 3, className = '' }: NftGridProps) {
  const displayItems = items.slice(0, limit);

  const gridColsClass =
    {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
    }[columns] || 'grid-cols-3';

  return (
    <div className={`grid ${gridColsClass} gap-2 ${className}`}>
      {displayItems.map((nft, index) => (
        <div
          key={nft.id || index}
          className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
          <img
            src={nft.imageUrl || '/placeholder.svg'}
            alt={nft.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
