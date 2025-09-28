import { suiteCore } from '@/core/suite';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

export const agentRouter = createTRPCRouter({
  // Get users by agent ID
  getUsersByAgentId: publicProcedure.input(z.string()).query(async ({ input: agentId }) => {
    return suiteCore.users.getUsersByAgentId(agentId);
  }),

  // Get users by agent ID with pagination
  getUsersByAgentIdPaginated: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input: { agentId, limit, offset } }) => {
      return suiteCore.users.getUsersByAgentId(agentId, limit, offset);
    }),

  // Get user count by agent ID
  getUsersByAgentIdCount: publicProcedure.input(z.string()).query(async ({ input: agentId }) => {
    return suiteCore.users.getUsersByAgentIdCount(agentId);
  }),
});
