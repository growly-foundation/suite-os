import { SystemErrorMessageContent } from '@growly/core';
import { AlertCircle } from 'lucide-react';

export const buildSystemErrorMessage = (
  content: SystemErrorMessageContent['content'],
  time: string
) => {
  return (
    <p className="text-sm">
      <span className="text-red-500 flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 opacity-50 mr-2" />
        {content}
      </span>
      <br />
      <span className="text-xs opacity-50">{time}</span>
    </p>
  );
};
