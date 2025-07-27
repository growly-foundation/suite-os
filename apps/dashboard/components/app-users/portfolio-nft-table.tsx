import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { consumePersona } from '@/core/persona';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, Eye, ImageIcon, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

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

  // Filter NFTs based on search query
  const filteredNfts = useMemo(() => {
    if (!searchQuery) return nftData;

    return nftData.filter(
      nft =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getChainNameById(nft.chainId)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nftData, searchQuery]);

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
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
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
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(nft.nft.address || '')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Contract
              </DropdownMenuItem>
              <DropdownMenuItem>
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
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <DynamicTable
          data={filteredNfts}
          columns={columns}
          enableSorting={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          enablePagination={true}
          pageSize={100}
          emptyMessage="No NFTs found"
          emptyDescription="No NFTs match your search criteria."
          className="h-[400px]"
          tableLabel="NFT Holdings"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search NFTs..."
        />
      </div>
    </div>
  );
}
