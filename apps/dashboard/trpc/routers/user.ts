import { suiteCore } from '@/core/suite';
import { z } from 'zod';

import { UserImportSource } from '@getgrowly/core';

import { baseProcedure, createTRPCRouter } from '../init';

export const userRouter = createTRPCRouter({
  // Get users by organization ID
  getUsersByOrganizationId: baseProcedure
    .input(z.string())
    .query(async ({ input: organizationId }) => {
      return suiteCore.users.getUsersByOrganizationId(organizationId);
    }),

  // Get users by organization ID with pagination
  getUsersByOrganizationIdPaginated: baseProcedure
    .input(
      z.object({
        organizationId: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input: { organizationId, limit, offset } }) => {
      return suiteCore.users.getUsersByOrganizationId(organizationId, limit, offset);
    }),

  // Get user count by organization ID
  getUsersByOrganizationIdCount: baseProcedure
    .input(z.string())
    .query(async ({ input: organizationId }) => {
      return suiteCore.users.getUsersByOrganizationIdCount(organizationId);
    }),

  // Get users by agent ID
  getUsersByAgentId: baseProcedure.input(z.string()).query(async ({ input: agentId }) => {
    return suiteCore.users.getUsersByAgentId(agentId);
  }),

  // Get users by agent ID with pagination
  getUsersByAgentIdPaginated: baseProcedure
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
  getUsersByAgentIdCount: baseProcedure.input(z.string()).query(async ({ input: agentId }) => {
    return suiteCore.users.getUsersByAgentIdCount(agentId);
  }),

  // Get user by ID
  getUserById: baseProcedure.input(z.string()).query(async ({ input: userId }) => {
    return suiteCore.users.getUserById(userId);
  }),

  // Get user by wallet address
  getUserByWalletAddress: baseProcedure
    .input(z.string())
    .query(async ({ input: walletAddress }) => {
      return suiteCore.users.getUserByWalletAddress(walletAddress);
    }),

  // Delete users (batch operation)
  deleteUsers: baseProcedure.input(z.array(z.string())).mutation(async ({ input: userIds }) => {
    await suiteCore.users.deleteUsers(userIds);
    return { success: true, deletedCount: userIds.length };
  }),

  // Create user from address if not exists
  createUserFromAddressIfNotExist: baseProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        organizationId: z.string(),
        importedSourceData: z
          .object({
            source: z.nativeEnum(UserImportSource),
            sourceData: z.record(z.unknown()),
          })
          .optional(),
      })
    )
    .mutation(async ({ input: { walletAddress, organizationId, importedSourceData } }) => {
      return suiteCore.users.createUserFromAddressIfNotExist(
        walletAddress,
        organizationId,
        importedSourceData
      );
    }),
});
