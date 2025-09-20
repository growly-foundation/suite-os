import { createTRPCRouter } from '../init';
import { agentRouter } from './agent';
import { personaRouter } from './persona';
import { userRouter } from './user';

export const appRouter = createTRPCRouter({
  agent: agentRouter,
  persona: personaRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
