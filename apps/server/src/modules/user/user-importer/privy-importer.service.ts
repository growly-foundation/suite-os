import { Injectable, Logger } from '@nestjs/common';
import { PrivyClient, User as PrivyUser } from '@privy-io/server-auth';

@Injectable()
export class PrivyImporterService {
  private readonly logger = new Logger(PrivyImporterService.name);

  // Must be careful with storing the app id and app secret from the customer account (encrypted).
  async getUsers(appId: string, appSecret: string): Promise<PrivyUser[]> {
    this.logger.log('Fetching users from Privy');
    const users = await new PrivyClient(appId.trim(), appSecret.trim()).getUsers();
    this.logger.log(`Fetched ${users.length} users from Privy`);
    return users;
  }
}
