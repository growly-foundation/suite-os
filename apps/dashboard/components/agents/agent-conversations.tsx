'use client';

import { UserDetails } from '@/components/app-users/app-user-details';
import { UsersList } from '@/components/app-users/app-user-list';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { users } from '@/lib/data/mock';
import { User } from '@/lib/types/users';
import { useState } from 'react';

export function AgentConversations() {
  const [selectedUser, setSelectedUser] = useState<User>(users[1]); // Default to second user

  return (
    <div className="w-full overflow-hidden">
      <div className="flex h-[82vh]">
        <UsersList users={users} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        <ConversationArea selectedUser={selectedUser} />
        <UserDetails user={selectedUser} />
      </div>
    </div>
  );
}
