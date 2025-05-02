import { MessageId } from '@/models/message';

/// Returns the next message id based on the current message id.
export const getNextMessageId = (currentMessageId: MessageId): MessageId => {
  const id = currentMessageId.split('-')[1];
  return `message-${Number(id) + 1}`;
};
