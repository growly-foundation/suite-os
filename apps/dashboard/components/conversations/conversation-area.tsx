'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/types/users';
import { MoreVertical, Phone, Search, Send } from 'lucide-react';
import { useState } from 'react';

import { ChatPanelContainer } from '@getgrowly/suite';

interface ConversationAreaProps {
  selectedUser: User;
}

export function ConversationArea({ selectedUser }: ConversationAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={selectedUser.avatar || '/placeholder.svg'}
              alt={selectedUser.address}
            />
            <AvatarFallback>{selectedUser.address}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{selectedUser.ensName}</p>
            <p className="text-xs text-muted-foreground">
              {selectedUser.online ? 'Online now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ChatPanelContainer
        walletAddress={selectedUser.address as any}
        isSending={false}
        sendMessageHandler={() => {}}
      />
      <Input
        placeholder="Write Something"
        className="flex-1"
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
      />
      <Button
        type="submit"
        size="icon"
        className="rounded-full bg-blue-500 hover:bg-blue-600"
        disabled={!newMessage.trim()}>
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
