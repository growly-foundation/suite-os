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

import {
  ExtractDescriptionDto,
  ExtractDescriptionResponseDto,
} from './dto/extract-description.dto';
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
  async getContractABI(@Param('address') address: string, @Query('chainId') chainId?: number) {
    return {
      abi: await this.resourcesService.getContractABI(address, chainId),
    };
  }

  // Extract description for website links
  @Post('link/extract-description')
  async extractDescription(
    @Body() dto: ExtractDescriptionDto
  ): Promise<ExtractDescriptionResponseDto> {
    return this.resourcesService.extractWebsiteDescription(dto);
  }
}
