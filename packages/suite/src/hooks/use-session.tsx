import { suiteCoreService } from '@/services/core.service';
import { create } from 'zustand';
import { Agent, AgentId, ParsedUser } from '@growly/core';

type Optional<T> = T | undefined | null;

interface WidgetSession {
  user: Optional<ParsedUser>;
  agent: Optional<Agent>;
  setUser: (user: Optional<ParsedUser>) => void;
  setAgent: (agent: Optional<Agent>) => void;
  createUserFromAddressIfNotExist: (walletAddress: `0x${string}`) => Promise<Optional<ParsedUser>>;
  fetchOrganizationAgentById: (agentId: AgentId, apiKey: string) => Promise<Optional<Agent>>;
}

export const useWidgetSession = create<WidgetSession>(set => ({
  user: undefined,
  agent: undefined,
  setUser: user => set({ user }),
  setAgent: agent => set({ agent }),
  createUserFromAddressIfNotExist: async walletAddress => {
    try {
      const users = await suiteCoreService.callDatabaseService('users', 'getAll', []);
      const parsedUser = users.find(user => {
        return (user.entities as { walletAddress: string }).walletAddress === walletAddress;
      });
      if (parsedUser) {
        set({ user: parsedUser as any });
        return parsedUser as any;
      }

      // Create new user if not exist.
      const newUser = await suiteCoreService.callDatabaseService('users', 'create', [
        {
          entities: {
            walletAddress,
          },
        },
      ]);
      console.log(newUser);
      set({ user: newUser as any });
      return newUser as any;
    } catch (error) {
      throw new Error(`Failed to fetch user from wallet address: ${error}`);
    }
  },
  fetchOrganizationAgentById: async (agentId, apiKey) => {
    try {
      const agent = await suiteCoreService.callDatabaseService('agents', 'getOneByFields', [
        {
          id: agentId,
          organization_id: apiKey,
        },
      ]);
      set({ agent: agent as any });
      return agent as any;
    } catch (error) {
      throw new Error(`Failed to fetch agent by ID: ${error}`);
    }
  },
}));
