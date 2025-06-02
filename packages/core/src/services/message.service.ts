import { Message } from '@/models';

import { PublicDatabaseService } from './database.service';

export class MessageService {
  constructor(private messageDatabaseService: PublicDatabaseService<'messages'>) {}

  async getMessageOfAgentAndUser(agent_id: string, user_id: string): Promise<Message[]> {
    return this.messageDatabaseService.getAllByFields({
      agent_id,
      user_id,
    });
  }
}
