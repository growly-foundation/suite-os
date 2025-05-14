import { Module } from '@nestjs/common';
import { SuiteCoreController } from './suite-core.controller';
import { SuiteCoreService } from './suite-core.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/databases/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [SuiteCoreController],
  providers: [SuiteCoreService],
})
export class SuiteCoreModule {}
