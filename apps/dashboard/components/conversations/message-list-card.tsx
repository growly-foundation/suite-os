'use client';

import { consumePersona } from '@/core/persona';
import { suiteCore } from '@/core/suite';
import { cn } from '@/lib/utils';
import { Bot, Loader2, MessageCircle, User } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { ParsedMessage, ParsedUser } from '@getgrowly/core';
import { RenderMessageContent } from '@getgrowly/suite';
import { truncateAddress } from '@getgrowly/ui';

import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';
import { UserDetails } from '../app-users/app-user-details';
import { useComponent } from '../providers/component-provider';
import { ResizableSheet } from '../ui/resizable-sheet';

interface MessageListCardProps {
  message: ParsedMessage;
  selected: boolean;
  className?: string;
}

export const MessageListCard = ({ message, selected, className }: MessageListCardProps) => {
  const { open, close, isOpen } = useComponent('user-details');
  const [loadingUser, setLoadingUser] = useState(false);
  const [user, setUser] = useState<ParsedUser | null>(null);

  const renderSenderIcon = (sender: string) => {
    switch (sender) {
      case 'user':
        if (!user) return <User className="h-4 w-4" />;
        return <AppUserAvatarWithStatus user={user} />;
      case 'assistant':
        return <Bot className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderSender = () => {
    if (message.sender === 'user') {
      if (loadingUser) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      return user
        ? consumePersona(user)?.nameService().name ||
            truncateAddress(user.entities.walletAddress, 10, 4)
        : 'Unknown User';
    }
    return 'Agent';
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!message.sender_id) return;
      setLoadingUser(true);
      const user = await suiteCore.users.getUserById(message.sender_id);
      if (!user) return;
      setUser(user);
      setLoadingUser(false);
    };
    fetchUser();
  }, [message]);

  return (
    <React.Fragment>
      <div
        onClick={() => message.sender === 'user' && open()}
        className={cn(
          'mb-1 px-4 py-2 cursor-pointer rounded-lg',
          message.sender === 'user'
            ? 'bg-muted/5 hover:bg-muted'
            : 'bg-background hover:bg-muted/25',
          className
        )}>
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
            {renderSenderIcon(message.sender)}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{renderSender()}</span>
              <span className="text-xs text-muted-foreground">
                {moment(message.created_at).fromNow()}
              </span>
            </div>
            <div className="prose text-xs prose-sm max-w-none dark:prose-invert">
              <RenderMessageContent message={message} />
            </div>
          </div>
        </div>
      </div>
      {/* User Details Drawer */}
      <ResizableSheet
        side="right"
        open={isOpen && selected}
        onOpenChange={isOpen => (isOpen ? open() : close())}>
        {user && <UserDetails user={user} />}
      </ResizableSheet>
    </React.Fragment>
  );
};
