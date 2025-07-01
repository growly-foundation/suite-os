'use client';

import { Badge } from '@/components/ui/badge';
import { Loadable } from '@/components/ui/loadable';
import { useUserLastMessageEffect } from '@/hooks/use-user-effect';
import { getBadgeColor } from '@/lib/color.utils';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import moment from 'moment';
import { useMemo } from 'react';

import { ParsedMessage, ParsedUser } from '@getgrowly/core';

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

export function LatestUserMessage({ user }: UserMessageDisplayProps) {
  const { loading, latestMessage } = useUserLastMessageEffect(user);
  const messageType = useMemo(() => {
    try {
      const parsedContent: ParsedMessage = JSON.parse(latestMessage?.content || '');
      return parsedContent.type;
    } catch (error) {
      console.error('Failed to parse message content:', error);
      return '';
    }
  }, [latestMessage]);

  return (
    <Loadable loading={loading}>
      {latestMessage && (
        <Badge className={cn(getBadgeColor(messageType), 'rounded-full')}>{messageType}</Badge>
      )}
    </Loadable>
  );
}

export const createChatSessionColumns = (): TableColumn<ParsedUser>[] => {
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
      aggregateDisabled: true,
    },
    {
      key: 'latestMessageContent',
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Latest User Message"
        />
      ),
      type: ColumnType.OBJECT,
      dataExtractor: (user: ParsedUser) => user,
      contentRenderer: (extractedData: ParsedUser) => <LatestUserMessage user={extractedData} />,
      sortable: false,
      aggregateDisabled: true,
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
      aggregateDisabled: true,
    },
  ];
};
