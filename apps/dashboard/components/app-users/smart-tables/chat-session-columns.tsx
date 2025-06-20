'use client';

import { Loadable } from '@/components/ui/loadable';
import { useUserLastMessageEffect } from '@/hooks/use-user-effect';
import { Calendar } from 'lucide-react';
import moment from 'moment';

import { ParsedUser } from '@getgrowly/core';

import { ColumnType, TableColumn } from '../types';
import { HeadLabelWithIcon } from './table-head-label';

interface UserMessageDisplayProps {
  user?: ParsedUser;
}

/**
 * Display component for the latest message timestamp of a user
 */
export function LatestMessageTime({ user }: UserMessageDisplayProps) {
  const { loading, latestMessage } = useUserLastMessageEffect(user);

  return (
    <Loadable loading={loading}>
      {latestMessage && (
        <span className="text-xs">{moment(latestMessage.created_at).fromNow()}</span>
      )}
    </Loadable>
  );
}

/**
 * Display component for the latest agent a user interacted with
 */
export function LatestInteractedAgent({ user }: UserMessageDisplayProps) {
  const { loading, lastestAgent } = useUserLastMessageEffect(user);

  return (
    <Loadable loading={loading}>
      {lastestAgent && <span className="text-xs">{lastestAgent.name}</span>}
    </Loadable>
  );
}

export const createChatSessionColumns = (user?: ParsedUser): TableColumn<ParsedUser>[] => {
  return [
    {
      key: 'latestMessageAt',
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Latest Message At"
        />
      ),
      type: ColumnType.OBJECT,
      dataExtractor: (user: ParsedUser) => user,
      contentRenderer: (extractedData: ParsedUser) => <LatestMessageTime user={extractedData} />,
      sortable: false,
    },
    {
      key: 'latestInteractedAgent',
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Latest Interacted Agent"
        />
      ),
      type: ColumnType.OBJECT,
      dataExtractor: (user: ParsedUser) => user,
      contentRenderer: (extractedData: ParsedUser) => (
        <LatestInteractedAgent user={extractedData} />
      ),
      sortable: false,
    },
  ];
};
