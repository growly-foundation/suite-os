import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ContractImporterService {
  private readonly logger = new Logger(ContractImporterService.name);

  constructor() {}
}
