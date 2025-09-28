import { agentRouter } from './api/routers/agent';
import { alchemyRouter } from './api/routers/alchemy';
import { blockscoutRouter } from './api/routers/blockscout';
import { etherscanRouter } from './api/routers/etherscan';
import { personaRouter } from './api/routers/persona';
import { talentRouter } from './api/routers/talent';
import { userRouter } from './api/routers/user';
import { zerionRouter } from './api/routers/zerion';
import { createCallerFactory, createTRPCRouter } from './trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  agent: agentRouter,
  blockscout: blockscoutRouter,
  etherscan: etherscanRouter,
  zerion: zerionRouter,
  talent: talentRouter,
  persona: personaRouter,
  alchemy: alchemyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
