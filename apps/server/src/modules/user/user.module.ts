import { BullModule, BullModule as NestBullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlchemyModule } from '../alchemy/alchemy.module';
import { DatabaseModule } from '../databases/database.module';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { PERSONA_QUEUE } from '../sync-persona/persona.queue';
import { ContractImporterService } from './user-importer/contract-importer.service';
import { PrivyImporterService } from './user-importer/privy-importer.service';
import { UserImporterService } from './user-importer/user-importer.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    DatabaseModule,
    EtherscanModule,
    BullModule,
    AlchemyModule,
    NestBullModule.registerQueue({
      name: PERSONA_QUEUE,
    }),
  ],
  providers: [UserService, UserImporterService, PrivyImporterService, ContractImporterService],
  controllers: [UserController],
})
export class UserModule {}
