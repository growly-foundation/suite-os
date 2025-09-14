import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { consumePersona } from '@/core/persona';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { formatAssetValue } from '@/lib/number.utils';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, ImageIcon, MoreHorizontal } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { TMarketNft } from '@getgrowly/chainsmith/types';
import { getChainNameById } from '@getgrowly/chainsmith/utils';

import { DynamicTable } from './smart-tables/dynamic-table';

interface PortfolioNftTableProps {
  userPersona: ReturnType<typeof consumePersona>;
}

// Define the NFT data type
interface NftData {
  name: string;
  tokenID: string;
  imageUrl?: string;
  chainId: number;
  usdValue?: number;
  nft: TMarketNft; // Original NFT object
}

export function PortfolioNftTable({ userPersona }: PortfolioNftTableProps) {
  const nfts = userPersona.universalNftList();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const { handlePeekTokenMultichain } = usePeekExplorer();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Transform NFTs to the format expected by table
  const nftData: NftData[] = useMemo(() => {
    return nfts.map(nft => ({
      name: nft.name || '',
      tokenID: nft.tokenID || '',
      imageUrl: nft.imageUrl,
      chainId: nft.chainId,
      usdValue: nft.usdValue || 0,
      nft: nft,
    }));
  }, [nfts]);

  // Filter and paginate NFTs
  const filteredNfts = useMemo(() => {
    let filtered = nftData;

    // Apply search filter
    if (searchQuery) {
      filtered = nftData.filter(
        nft =>
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getChainNameById(nft.chainId)?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply pagination
    return filtered.slice(0, page * PAGE_SIZE);
  }, [nftData, searchQuery, page, PAGE_SIZE]);

  // Check if there are more items to load
  const hasMore = useMemo(() => {
    const filtered = searchQuery
      ? nftData.filter(
          nft =>
            nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getChainNameById(nft.chainId)?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : nftData;
    return page * PAGE_SIZE < filtered.length;
  }, [nftData, searchQuery, page, PAGE_SIZE]);

  // Handle loading more items
  const handleLoadMore = useCallback(({ page }: { page: number; pageSize: number }) => {
    setPage(page);
  }, []);

  // Calculate total value
  const totalValue = useMemo(() => {
    return nfts.reduce((sum, nft) => sum + (nft.usdValue || 0), 0);
  }, [nfts]);

  // Define columns for the DynamicTable
  const columns: ColumnDef<NftData>[] = [
    {
      accessorKey: 'name',
      header: 'NFT',
      cell: ({ row }) => {
        const nft = row.original;
        return (
          <div className="flex items-center space-x-3">
            {/* NFT Image */}
            {nft.imageUrl ? (
              <img src={nft.imageUrl} alt={nft.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}

            {/* NFT Info */}
            <div className="flex flex-col">
              <div className="font-semibold text-gray-900 truncate max-w-[200px]">{nft.name}</div>
              <div className="text-sm text-gray-600">#{nft.tokenID}</div>
            </div>
          </div>
        );
      },
      size: 250,
      minSize: 250,
      meta: {
        frozen: true,
      },
    },
    {
      accessorKey: 'usdValue',
      header: 'Value',
      cell: ({ row }) => {
        const nft = row.original;
        const value = nft.usdValue || 0;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return (
          <div className="text-gray-900">
            <div className="font-semibold">${value.toFixed(2)}</div>
            <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of portfolio</div>
          </div>
        );
      },
      size: 120,
      minSize: 120,
    },
    {
      accessorKey: 'chainId',
      header: 'Chain',
      cell: ({ row }) => {
        const chainName = getChainNameById(row.original.chainId);
        return (
          <Badge variant="outline" className="text-xs">
            {chainName}
          </Badge>
        );
      },
      size: 100,
      minSize: 100,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const nft = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(nft.nft.address || '')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Contract
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeekTokenMultichain(nft.nft.address || '')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
      minSize: 50,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* DynamicTable */}
      <div className="border border-gray-200 rounded-lg overflow-hidden h-[400px]">
        <DynamicTable
          data={filteredNfts}
          columns={columns}
          enableSorting={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          emptyMessage="No NFTs found"
          emptyDescription="No NFTs match your search criteria."
          className="h-[400px]"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search NFTs..."
          enableFooter={true}
          getFooterValue={key => {
            switch (key) {
              case 'name':
                return 'Total';
              case 'usdValue':
                return formatAssetValue(totalValue);
              default:
                return '';
            }
          }}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
