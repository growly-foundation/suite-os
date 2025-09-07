import { AlertCircle } from 'lucide-react';

import { SystemErrorMessageContent } from '@getgrowly/core';

export const SystemErrorMessage = ({
  content,
}: {
  content: SystemErrorMessageContent['content'];
}) => {
  return (
    <p
      className="gas-font-family gas-text-sm"
      style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
      <span
        className="gas-font-family gas-text-red-500 gas-flex gas-items-center gas-space-x-2"
        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        <AlertCircle className="gas-w-4 gas-h-4 gas-opacity-50 gas-mr-2" />
        {content}
      </span>
    </p>
  );
};

export const buildSystemErrorMessage = (content: SystemErrorMessageContent['content']) => {
  return <SystemErrorMessage content={content} />;
};
