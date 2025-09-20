import { PersonaService } from '@/lib/services/persona.service';
import { z } from 'zod';

import { baseProcedure, createTRPCRouter } from '../init';

export const personaRouter = createTRPCRouter({
  // Get aggregated identities for multiple addresses (batch loading)
  getAggregatedIdentities: baseProcedure
    .input(z.array(z.string()))
    .query(async ({ input: addresses }) => {
      return PersonaService.getAggregatedIdentities(addresses as any);
    }),

  // Get aggregated identity for a single address
  getAggregatedIdentity: baseProcedure.input(z.string()).query(async ({ input: address }) => {
    return PersonaService.getAggregatedIdentity(address as any);
  }),

  // Get name only for a single address
  getName: baseProcedure.input(z.string()).query(async ({ input: address }) => {
    return PersonaService.getNameOnly(address as any);
  }),

  // Get avatar only for a single address
  getAvatar: baseProcedure.input(z.string()).query(async ({ input: address }) => {
    return PersonaService.getAvatar(address as any);
  }),
});
