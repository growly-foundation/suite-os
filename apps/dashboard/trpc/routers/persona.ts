import { PersonaService } from '@/lib/services/persona.service';
import { Address } from 'viem';
import { z } from 'zod';

import { baseProcedure, createTRPCRouter } from '../init';

export const personaRouter = createTRPCRouter({
  // Get aggregated identities for multiple addresses (batch loading)
  getAggregatedIdentities: baseProcedure
    .input(z.array(z.string()))
    .query(async ({ input: addresses }) => {
      return PersonaService.getAggregatedIdentities(addresses as Address[]);
    }),

  // Get aggregated identity for a single address
  getAggregatedIdentity: baseProcedure.input(z.string()).query(async ({ input: address }) => {
    return PersonaService.getAggregatedIdentity(address as Address);
  }),

  // Get avatar for a single address
  getAvatar: baseProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input: { address } }) => {
      return PersonaService.getAvatar(address as Address);
    }),

  // Get name only for a single address
  getNameOnly: baseProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input: { address } }) => {
      return PersonaService.getNameOnly(address as Address);
    }),

  // Get names only for multiple addresses (batch loading)
  getNamesOnly: baseProcedure
    .input(z.object({ addresses: z.array(z.string()) }))
    .query(async ({ input: { addresses } }) => {
      return PersonaService.getNamesOnly(addresses as Address[]);
    }),
});
