import { Code, FileText, Globe, Text as TextIcon } from 'lucide-react';

import { ResourceType } from '@getgrowly/core';

import { IconContainer } from '../ui/icon-container';

export const ResourceIcon = ({ type, className }: { type: ResourceType; className?: string }) => {
  const icon = (type: ResourceType) => {
    switch (type) {
      case 'contract':
        return <Code className="h-3 w-3" />;
      case 'link':
        return <Globe className="h-3 w-3" />;
      case 'document':
        return <FileText className="h-3 w-3" />;
      case 'text':
        return <TextIcon className="h-3 w-3" />;
    }
  };
  return (
    <IconContainer type="primary" className={className}>
      {icon(type)}
    </IconContainer>
  );
};
