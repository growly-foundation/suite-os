import { User } from '@/models';

import { PublicDatabaseService } from './database.service';

export class UserService {
  constructor(
    private userDatabaseService: PublicDatabaseService<'users'>,
    private messageDatabaseService: PublicDatabaseService<'messages'>
  ) {}

  async getUsersByAgentId(agent_id: string): Promise<User[]> {
    const messages = await this.messageDatabaseService.getAllByFields({
      agent_id,
    });
    const users: Set<User> = new Set();
    for (const message of messages) {
      if (!message.user_id) continue;
      const user = await this.userDatabaseService.getById(message.user_id);
      if (!user) continue;
      users.add(user);
    }
    return Array.from(users);
  }
}
