import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Delete(':id')
  async deleteResource(@Param('id') id: string) {
    return this.resourcesService.deleteResource(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: any, @Body('documentType') documentType: string) {
    return this.resourcesService.uploadDocument(file, documentType);
  }

  @Get('contract/:address')
  async getContractABI(@Param('address') address: string, @Query('network') network?: string) {
    return {
      abi: await this.resourcesService.getContractABI(address, network),
    };
  }
}
