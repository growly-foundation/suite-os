import { Module } from '@nestjs/common';
import { SuiteCoreController } from './suite-core.controller';
import { SuiteCoreService } from './suite-core.service';

@Module({
  imports: [],
  controllers: [SuiteCoreController],
  providers: [SuiteCoreService],
})
export class SuiteCoreModule {}
