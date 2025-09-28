import { PersonaService } from '@/lib/services/persona.service';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { Address } from 'viem';
import { z } from 'zod';

export const personaRouter = createTRPCRouter({
  // Get aggregated identities for multiple addresses (batch loading)
  getAggregatedIdentities: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input: addresses }) => {
      return PersonaService.getAggregatedIdentities(addresses as Address[]);
    }),

  // Get aggregated identity for a single address
  getAggregatedIdentity: publicProcedure.input(z.string()).query(async ({ input: address }) => {
    return PersonaService.getAggregatedIdentity(address as Address);
  }),

  // Get avatar for a single address
  getAvatar: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input: { address } }) => {
      return PersonaService.getAvatar(address as Address);
    }),

  // Get name only for a single address
  getNameOnly: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input: { address } }) => {
      return PersonaService.getNameOnly(address as Address);
    }),

  // Get names only for multiple addresses (batch loading)
  getNamesOnly: publicProcedure
    .input(z.object({ addresses: z.array(z.string()) }))
    .query(async ({ input: { addresses } }) => {
      return PersonaService.getNamesOnly(addresses as Address[]);
    }),
});
