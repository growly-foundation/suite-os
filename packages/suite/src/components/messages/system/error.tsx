import { AlertCircle } from 'lucide-react';

import { SystemErrorMessageContent } from '@getgrowly/core';

export const SystemErrorMessage = ({
  content,
}: {
  content: SystemErrorMessageContent['content'];
}) => {
  return (
    <p className="text-sm" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
      <span
        className="text-red-500 flex items-center space-x-2"
        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        <AlertCircle className="w-4 h-4 opacity-50 mr-2" />
        {content}
      </span>
    </p>
  );
};

export const buildSystemErrorMessage = (content: SystemErrorMessageContent['content']) => {
  return <SystemErrorMessage content={content} />;
};
