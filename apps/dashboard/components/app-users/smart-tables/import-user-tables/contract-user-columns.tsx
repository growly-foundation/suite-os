'use client';

import {
  ImportUserOutput,
  ImportedUserSourceData,
  ParsedUser,
  UserImportSource,
} from '@getgrowly/core';

import { ColumnType, SmartTableColumn } from '../../types';

export function createContractUserColumns(
  user: ParsedUser | undefined,
  checkRequired: boolean
): SmartTableColumn<ImportUserOutput>[] {
  if (
    checkRequired &&
    (!user ||
      !(user.personaData.imported_source_data as ImportedUserSourceData[]).some(
        d => d.source === UserImportSource.Contract
      ))
  )
    return [];
  return [
    {
      key: 'extra',
      header: 'Contract Data',
      type: ColumnType.COMPONENT,
      dataExtractor: () => undefined,
      contentRenderer: (extractedData: any) => {
        const extra = extractedData?.extra;
        if (!extra) return <span className="text-muted-foreground">No data</span>;

        // Display contract interaction data
        const interactionCount = extra.interactionCount || 0;
        const lastInteraction = extra.lastInteraction;
        const tokenBalance = extra.tokenBalance;

        return (
          <div className="space-y-1">
            {interactionCount > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Interactions:</span> {interactionCount}
              </div>
            )}
            {lastInteraction && (
              <div className="text-xs">
                <span className="text-muted-foreground">Last:</span>{' '}
                {new Date(lastInteraction).toLocaleDateString()}
              </div>
            )}
            {tokenBalance && (
              <div className="text-xs">
                <span className="text-muted-foreground">Balance:</span> {tokenBalance}
              </div>
            )}
          </div>
        );
      },
    },
  ];
}
