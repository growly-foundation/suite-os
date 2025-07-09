import { Injectable } from '@nestjs/common';

import { ImportPrivyUserOutput, ImportUserOutput, UserImportSource } from '@getgrowly/core';

import { PrivyImporterService } from './privy-importer.service';

@Injectable()
export class UserImporterService {
  constructor(private readonly privyImporterService: PrivyImporterService) {}

  async importUsersFromPrivy(appId: string, appSecret: string): Promise<ImportPrivyUserOutput[]> {
    const users = await this.privyImporterService.getUsers(appId, appSecret);
    return users.map(user => ({
      walletAddress: user.wallet?.address || user.smartWallet?.address,
      email: user.email?.address,
      extra: user,
      source: UserImportSource.Privy,
    }));
  }

  async saveUsers(users: ImportUserOutput[]) {
    return users;
  }
}
