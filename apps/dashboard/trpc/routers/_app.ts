import { createTRPCRouter } from '../init';
import { agentRouter } from './agent';
import { alchemyRouter } from './alchemy';
import { blockscoutRouter } from './blockscout';
import { etherscanRouter } from './etherscan';
import { personaRouter } from './persona';
import { talentRouter } from './talent';
import { userRouter } from './user';
import { zerionRouter } from './zerion';

export const appRouter = createTRPCRouter({
  agent: agentRouter,
  persona: personaRouter,
  user: userRouter,
  blockscout: blockscoutRouter,
  zerion: zerionRouter,
  alchemy: alchemyRouter,
  etherscan: etherscanRouter,
  talent: talentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
