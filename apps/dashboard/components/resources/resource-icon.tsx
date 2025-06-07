import { Code, FileText, Globe } from 'lucide-react';

import { ResourceType } from '@getgrowly/core';

export const ResourceIcon = ({ type }: { type: ResourceType }) => {
  switch (type) {
    case 'contract':
      return <Code className="h-4 w-4" />;
    case 'link':
      return <Globe className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
  }
};
