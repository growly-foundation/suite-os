import { BullModule, BullModule as NestBullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { PERSONA_QUEUE } from '../sync-persona/persona.queue';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    DatabaseModule,
    EtherscanModule,
    BullModule,
    NestBullModule.registerQueue({
      name: PERSONA_QUEUE,
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
