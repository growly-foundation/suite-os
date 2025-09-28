import { TalentService } from '@/lib/services/talent.service';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { TalentProfile } from '@/types/talent';
import { z } from 'zod';

const queryInput = z.object({
  id: z.string().min(1),
  account_source: z.enum(['wallet', 'farcaster', 'github']).optional(),
  slug: z.string().optional(),
  scorer_slug: z.string().optional(),
});

export const talentRouter = createTRPCRouter({
  getProfile: publicProcedure.input(queryInput).query(async ({ input }): Promise<TalentProfile> => {
    const apiKey = process.env.TALENT_API_KEY;
    if (!apiKey) throw new Error('TALENT_API_KEY is not configured');

    const svc = new TalentService({ apiKey });
    return await svc.getProfile(input);
  }),
});
