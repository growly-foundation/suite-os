import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlchemyService } from './alchemy.service';

@Module({
  imports: [ConfigModule],
  providers: [AlchemyService],
  exports: [AlchemyService],
})
export class AlchemyModule {}
