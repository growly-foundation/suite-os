import { suiteCore } from '@/core/suite';
import { useEffect, useState } from 'react';

import { Agent, Message, ParsedUser } from '@getgrowly/core';

export const useUserLastMessageEffect = (user?: ParsedUser) => {
  const [loading, setLoading] = useState(true);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [lastestAgent, setLastestAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const fetchLatestMessage = async () => {
      if (!user) return;
      setLoading(true);

      const lastConversation = user.chatSession?.lastConversation;
      if (!lastConversation?.messageId) return setLoading(false);

      const message = await suiteCore.db.messages.getById(lastConversation.messageId);
      if (!message) return setLoading(false);

      const agent = await suiteCore.db.agents.getById(lastConversation.agentId);
      if (!agent) return setLoading(false);

      setLatestMessage(message);
      setLastestAgent(agent);
      setLoading(false);
    };
    fetchLatestMessage();
  }, [!!user]);

  return { loading, latestMessage, lastestAgent };
};
