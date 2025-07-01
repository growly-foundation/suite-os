import { USER_LAST_MESSAGE_CACHE_TIME } from '@/constants/cache';
import { suiteCore } from '@/core/suite';
import { useQuery } from '@tanstack/react-query';

import { ParsedUser } from '@getgrowly/core';

export const useUserLastMessageEffect = (user?: ParsedUser) => {
  const fetchUserLastMessage = async () => {
    if (!user) return { latestMessage: null, lastestAgent: null };

    const lastConversation = await suiteCore.conversations.getLatestConversation(user.id);
    if (!lastConversation) return { latestMessage: null, lastestAgent: null };

    const latestConversationMessage = await suiteCore.db.messages.getOneByFields(
      {
        conversation_id: lastConversation.id,
      },
      {
        field: 'created_at',
        ascending: false,
      }
    );
    if (!latestConversationMessage) return { latestMessage: null, lastestAgent: null };

    const agent = await suiteCore.db.agents.getById(lastConversation.agent_id!);
    return {
      latestMessage: latestConversationMessage,
      lastestAgent: agent || null,
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['userLastMessage', user?.id],
    queryFn: fetchUserLastMessage,
    enabled: !!user,
    staleTime: Infinity,
    gcTime: USER_LAST_MESSAGE_CACHE_TIME,
  });

  return {
    loading: isLoading,
    latestMessage: data?.latestMessage || null,
    lastestAgent: data?.lastestAgent || null,
  };
};
