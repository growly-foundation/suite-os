import { consumePersona } from '@/core/persona';
import { ColumnDef, Row } from '@tanstack/react-table';
import moment from 'moment';

import { ImportedUserSourceData, ParsedUser, UserImportSource } from '@getgrowly/core';

import { getFormatter, hasData } from './column-formatters';

// Hard-coded column definitions for special cases that need custom logic
export const columnUserDefinitions: Record<string, ColumnDef<ParsedUser>> = {
  identity: {
    id: 'identity',
    accessorFn: (row: ParsedUser) => {
      const walletAddress =
        'walletAddress' in row ? row.walletAddress || '' : 'id' in row ? row.id : '';
      const name = 'name' in row ? row.name : '';
      return `${name}${walletAddress}`.toLowerCase();
    },
    header: 'Identity',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('identity')(row.original),
    enableSorting: true,
    enableResizing: true,
    meta: { frozen: true },
    size: 240,
    minSize: 240,
  },

  talentProtocolCheckmark: {
    id: 'talentProtocolCheckmark',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        return 1;
      }
      return 0;
    },
    header: 'Verified',
    cell: ({ row }: { row: Row<ParsedUser> }) =>
      getFormatter('talentProtocolCheckmark')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 110,
    minSize: 110,
  },

  firstSignedIn: {
    id: 'firstSignedIn',
    accessorFn: (row: ParsedUser) => {
      const date = 'created_at' in row ? new Date(row.created_at).getTime() : new Date().getTime();
      return date;
    },
    header: 'First Signed In',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('firstSignedIn')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 150,
    minSize: 150,
  },

  trait: {
    id: 'trait',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        // Return actual trait value from personaData
        return (row as any).personaData?.trait || '';
      }
      return '';
    },
    header: 'Trait',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('trait')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
    minSize: 120,
  },

  portfolioValue: {
    id: 'portfolioValue',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        return (row as any).personaData?.portfolio_snapshots?.totalValue || 0;
      }
      return 0;
    },
    header: 'Portfolio Value',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('portfolioValue')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 160,
  },

  transactions: {
    id: 'transactions',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.universalTransactions()?.length || 0;
      }
      return 0;
    },
    header: 'Transactions',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('transactions')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 160,
  },

  tokens: {
    id: 'tokens',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const portfolio = (row as any).personaData?.portfolio_snapshots?.tokenPortfolio
          ?.chainRecordsWithTokens;
        const tokenCount = Object.values(portfolio || {}).reduce(
          (sum: number, chain: any) => sum + (chain?.tokens?.length || 0),
          0
        );
        return tokenCount;
      }
      return 0;
    },
    header: 'Tokens',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('tokens')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 270,
    minSize: 270,
  },

  activity: {
    id: 'activity',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.getLatestActivity()?.timestamp || 0;
      }
      return 0;
    },
    header: 'Activity',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('activity')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 400,
    minSize: 400,
  },

  walletCreatedAt: {
    id: 'walletCreatedAt',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.walletCreatedAt()?.getTime() || 0;
      }
      return 0;
    },
    header: 'Wallet Created At',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('walletCreatedAt')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
    minSize: 200,
  },

  // Privy imported data columns
  privyCreatedAt: {
    id: 'privyCreatedAt',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      const privyData = importedSourceData?.find(data => data.source === UserImportSource.Privy);
      return (privyData?.sourceData as any)?.createdAt || '';
    },
    header: 'Privy Created At',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];
      const privyData = importedSourceData?.find(data => data.source === UserImportSource.Privy);
      const createdAt = (privyData?.sourceData as any)?.createdAt;
      return createdAt ? (
        <span className="text-xs">{moment(createdAt).fromNow()}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 150,
    minSize: 120,
  },

  privyGithub: {
    id: 'privyGithub',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      const privyData = importedSourceData?.find(data => data.source === UserImportSource.Privy);
      return (privyData?.sourceData as any)?.github || '';
    },
    header: 'Github',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];
      const privyData = importedSourceData?.find(data => data.source === UserImportSource.Privy);
      const github = (privyData?.sourceData as any)?.github;
      return github ? (
        <span className="text-xs">{github}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 120,
    minSize: 100,
  },

  privyTwitter: {
    id: 'privyTwitter',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      const privyData = importedSourceData?.find(data => data.source === UserImportSource.Privy);
      return (privyData?.sourceData as any)?.twitter || '';
    },
    header: 'Twitter',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];
      const privyData = importedSourceData?.find(data => data.source === UserImportSource.Privy);
      const twitter = (privyData?.sourceData as any)?.twitter;
      return twitter ? (
        <span className="text-xs">{twitter}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 120,
    minSize: 100,
  },

  // Contract imported data columns
  contractAddress: {
    id: 'contractAddress',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      const contractData = importedSourceData?.find(
        data => data.source === UserImportSource.Contract
      );
      return (contractData?.sourceData as any)?.contractAddress || '';
    },
    header: 'Contract Address',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];
      const contractData = importedSourceData?.find(
        data => data.source === UserImportSource.Contract
      );
      const address = (contractData?.sourceData as any)?.contractAddress;
      return address ? (
        <span className="text-xs font-mono">{address}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 140,
  },

  contractTransactionCount: {
    id: 'contractTransactionCount',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      const contractData = importedSourceData?.find(
        data => data.source === UserImportSource.Contract
      );
      return (contractData?.sourceData as any)?.transactionCount || 0;
    },
    header: 'Transaction Count',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];
      const contractData = importedSourceData?.find(
        data => data.source === UserImportSource.Contract
      );
      const count = (contractData?.sourceData as any)?.transactionCount;
      return count ? (
        <span className="text-xs">{count}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 140,
    minSize: 120,
  },

  contractLastInteraction: {
    id: 'contractLastInteraction',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      const contractData = importedSourceData?.find(
        data => data.source === UserImportSource.Contract
      );
      return (contractData?.sourceData as any)?.lastInteraction || '';
    },
    header: 'Last Interaction',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];
      const contractData = importedSourceData?.find(
        data => data.source === UserImportSource.Contract
      );
      const lastInteraction = (contractData?.sourceData as any)?.lastInteraction;
      return lastInteraction ? (
        <span className="text-xs">{moment(lastInteraction).fromNow()}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 150,
    minSize: 120,
  },

  importSources: {
    id: 'importSources',
    accessorFn: (row: ParsedUser) => {
      const importedSourceData = row.personaData?.imported_source_data as ImportedUserSourceData[];
      if (!importedSourceData || importedSourceData.length === 0) {
        return 'Native';
      }
      return importedSourceData.map(data => data.source).join(', ');
    },
    header: 'Import Sources',
    cell: ({ row }: { row: Row<ParsedUser> }) => {
      const importedSourceData = row.original.personaData
        ?.imported_source_data as ImportedUserSourceData[];

      if (!importedSourceData || importedSourceData.length === 0) {
        return (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Native</span>
        );
      }

      const sources = importedSourceData.map(data => data.source);
      return (
        <div className="flex flex-wrap gap-1">
          {sources.map((source, index) => {
            const sourceLabels: Record<UserImportSource, string> = {
              [UserImportSource.Native]: 'Native',
              [UserImportSource.Privy]: 'Privy',
              [UserImportSource.Contract]: 'Contract',
              [UserImportSource.Manual]: 'Manual',
              [UserImportSource.Guildxyz]: 'Guild.xyz',
            };

            const sourceColors: Record<UserImportSource, string> = {
              [UserImportSource.Native]: 'bg-green-100 text-green-800',
              [UserImportSource.Privy]: 'bg-blue-100 text-blue-800',
              [UserImportSource.Contract]: 'bg-purple-100 text-purple-800',
              [UserImportSource.Manual]: 'bg-orange-100 text-orange-800',
              [UserImportSource.Guildxyz]: 'bg-pink-100 text-pink-800',
            };

            return (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded-full ${sourceColors[source]}`}>
                {sourceLabels[source]}
              </span>
            );
          })}
        </div>
      );
    },
    enableSorting: true,
    enableResizing: true,
    size: 200,
    minSize: 150,
  },
};

// Function to create dynamic columns based on data type
export function createUserColumns(data: ParsedUser[]): ColumnDef<ParsedUser>[] {
  if (data.length === 0) {
    return [columnUserDefinitions.identity];
  }

  const columns: ColumnDef<ParsedUser>[] = [];

  // Helper function to check if any row has persona data
  const hasPersonaDataInAnyRow = (data: ParsedUser[]): boolean => {
    return data.some(user => hasData(user, 'personaData'));
  };

  const hasImportedSourceDataInAnyRow = (data: ParsedUser[], source: UserImportSource): boolean => {
    return data.some(user => {
      const importedSourceData = user.personaData?.imported_source_data as ImportedUserSourceData[];
      return importedSourceData?.some(sourceData => sourceData.source === source);
    });
  };

  // Always include identity column
  columns.push(columnUserDefinitions.identity);

  // Add columns based on data availability across all rows
  if (hasPersonaDataInAnyRow(data)) {
    // ParsedUser columns - check if any user has persona data
    columns.push(
      columnUserDefinitions.talentProtocolCheckmark,
      columnUserDefinitions.firstSignedIn,
      columnUserDefinitions.trait,
      columnUserDefinitions.portfolioValue,
      columnUserDefinitions.transactions,
      columnUserDefinitions.tokens,
      columnUserDefinitions.activity,
      columnUserDefinitions.walletCreatedAt,
      columnUserDefinitions.importSources
    );

    // Add Privy-specific columns when available
    if (hasImportedSourceDataInAnyRow(data, UserImportSource.Privy)) {
      columns.push(
        columnUserDefinitions.privyCreatedAt,
        columnUserDefinitions.privyGithub,
        columnUserDefinitions.privyTwitter
      );
    }

    // Add Contract-specific columns when available
    if (hasImportedSourceDataInAnyRow(data, UserImportSource.Contract)) {
      columns.push(
        columnUserDefinitions.contractAddress,
        columnUserDefinitions.contractTransactionCount,
        columnUserDefinitions.contractLastInteraction
      );
    }
  } else {
    // If no persona data, still show import sources column
    columns.push(columnUserDefinitions.importSources);
  }
  return columns;
}
