import { TextMessageContent } from '@growly/core';

export const buildTextMessage = (content: TextMessageContent['content'], time: string) => {
  return (
    <p className="text-sm">
      <span className="flex items-center space-x-2">
        <div>{content}</div>
      </span>
      <br />
      <span className="text-xs opacity-50">{time}</span>
    </p>
  );
};
