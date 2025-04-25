import { Module } from '@nestjs/common';
import { SonicService } from './sonic.service';
import { SonicController } from './sonic.controller';

@Module({
  providers: [SonicService],
  exports: [SonicService],
  controllers: [SonicController],
})
export class SonicModule {}
