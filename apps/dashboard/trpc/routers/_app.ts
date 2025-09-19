import { createTRPCRouter } from '../init';
import { personaRouter } from './persona';

export const appRouter = createTRPCRouter({
  persona: personaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
