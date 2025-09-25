import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { WalletData } from '@/hooks/use-wallet-data';
import { formatAssetValue } from '@/lib/number.utils';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, ImageIcon, MoreHorizontal } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { getChainNameById } from '@getgrowly/chainsmith/utils';

import { ChainIcon } from '../ui/chain-icon';
import { DynamicTable } from './smart-tables/dynamic-table';

interface PortfolioNftTableProps {
  walletData: WalletData;
}

// Define the NFT data type based on Zerion API response
interface NftData {
  id: string;
  name: string;
  tokenID: string;
  imageUrl?: string;
  chainId: number;
  usdValue?: number;
  contractAddress?: string;
  collection?: string;
  attributes: any; // Raw attributes data
}

// Helper function to safely get chain ID from Zerion chain data
function safeGetChainId(chainData: any): number {
  if (!chainData) return 1; // Default to Ethereum

  const chainId = chainData.attributes?.external_id;
  if (typeof chainId === 'string') {
    const parsed = parseInt(chainId, 10);
    return isNaN(parsed) ? 1 : parsed;
  }
  return typeof chainId === 'number' ? chainId : 1;
}

export function PortfolioNftTable({ walletData }: PortfolioNftTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const { handlePeekTokenMultichain } = usePeekExplorer();
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Transform Zerion NFT positions to the format expected by table
  const nftData: NftData[] = useMemo(() => {
    return walletData.nftPositions.map((position: any) => {
      const attributes = position.attributes || {};
      const nftInfo = attributes.nft_info || {};
      const chainData = position.relationships?.chain?.data;

      return {
        id: position.id || '',
        name: nftInfo.name || 'Unnamed NFT',
        tokenID: nftInfo.token_id || '',
        imageUrl: nftInfo.content?.preview?.url || nftInfo.content?.detail?.url,
        chainId: safeGetChainId(chainData),
        usdValue: parseFloat(attributes.value || '0'),
        contractAddress: nftInfo.contract_address,
        collection: nftInfo.collection?.name,
        attributes: attributes,
      };
    });
  }, [walletData.nftPositions]);

  // Filter and paginate NFTs
  const filteredNfts = useMemo(() => {
    let filtered = nftData;

    // Apply search filter
    if (searchQuery) {
      filtered = nftData.filter(
        nft =>
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (nft.collection && nft.collection.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
            (nft.collection && nft.collection.toLowerCase().includes(searchQuery.toLowerCase())) ||
            getChainNameById(nft.chainId)?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : nftData;
    return page * PAGE_SIZE < filtered.length;
  }, [nftData, searchQuery, page, PAGE_SIZE]);

  // Handle loading more items
  const handleLoadMore = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setPage(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate total value
  const totalValue = useMemo(() => {
    return walletData.nftTotalUsd;
  }, [walletData.nftTotalUsd]);

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
        return <ChainIcon chainIds={[row.original.chainId]} />;
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
              <DropdownMenuItem onClick={() => copyToClipboard(nft.contractAddress || '')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Contract
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePeekTokenMultichain(nft.contractAddress || '')}>
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
          enableFooter={false}
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
          loadingMore={isLoading}
        />
      </div>
    </div>
  );
}
