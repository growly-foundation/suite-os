import { suiteCoreService } from '@/services/core.service';
import { create } from 'zustand';
import { Agent, AgentId, ParsedUser } from '@growly/core';

type Optional<T> = T | undefined | null;

interface WidgetSession {
  user: Optional<ParsedUser>;
  agent: Optional<Agent>;
  setUser: (user: Optional<ParsedUser>) => void;
  setAgent: (agent: Optional<Agent>) => void;
  fetchUserFromWalletAddress: (walletAddress: `0x${string}`) => Promise<Optional<ParsedUser>>;
  fetchAgentById: (agentId: AgentId) => Promise<Optional<Agent>>;
}

export const useWidgetSession = create<WidgetSession>(set => ({
  user: undefined,
  agent: undefined,
  setUser: user => set({ user }),
  setAgent: agent => set({ agent }),
  fetchUserFromWalletAddress: async walletAddress => {
    const users = await suiteCoreService.callDatabaseService('users', 'getAll', []);
    const parsedUser = users.find(user => {
      const entities = JSON.parse(user.entities as any);
      return entities.walletAddress === walletAddress;
    });
    if (!parsedUser) {
      return undefined;
    }

    const deserializedUser = {
      ...parsedUser,
      entities: JSON.parse(parsedUser.entities as any),
    };
    set({ user: deserializedUser });
    return deserializedUser;
  },
  fetchAgentById: async agentId => {
    const agent = await suiteCoreService.callDatabaseService('agents', 'getById', [agentId]);
    set({ agent });
    return agent;
  },
}));
