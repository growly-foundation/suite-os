import { TextMessageContent } from '@getgrowly/core';

export const TextMessage = ({ content }: { content: TextMessageContent['content'] }) => {
  return (
    <p
      className="gas-text-sm"
      style={{ margin: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
      <span
        className="gas-flex gas-items-center gas-space-x-2"
        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        {content}
      </span>
    </p>
  );
};

export const buildTextMessage = (content: TextMessageContent['content']) => {
  return <TextMessage content={content} />;
};
