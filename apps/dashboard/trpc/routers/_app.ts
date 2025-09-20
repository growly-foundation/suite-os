import { createTRPCRouter } from '../init';
import { agentRouter } from './agent';
import { blockscoutRouter } from './blockscout';
import { personaRouter } from './persona';
import { userRouter } from './user';

export const appRouter = createTRPCRouter({
  agent: agentRouter,
  persona: personaRouter,
  user: userRouter,
  blockscout: blockscoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
