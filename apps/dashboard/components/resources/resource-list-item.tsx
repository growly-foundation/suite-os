import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getBadgeColor } from '@/lib/color.utils';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Trash } from 'lucide-react';

import { ResourceType, TypedResource } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { ResourceIcon } from './resource-icon';

interface ResourceListItemProps<T extends ResourceType = ResourceType> {
  resource: TypedResource<T>;
  onDelete?: (id: string) => void;
  onClick?: (resource: TypedResource<T>) => void;
  disabled?: boolean;
  className?: string;
  noPreview?: boolean;
}

export function ResourceListItem<T extends ResourceType>({
  resource,
  onDelete,
  onClick,
  disabled,
  className,
  noPreview,
}: ResourceListItemProps<T>) {
  const renderPreview = () => {
    switch (resource.type) {
      case 'contract': {
        const value = resource as TypedResource<'contract'>;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Address:</span>
              <code className="text-xs bg-muted rounded px-1.5 py-0.5">
                <WalletAddress
                  address={value.value.address}
                  truncate
                  truncateLength={{ startLength: 8, endLength: 4 }}
                />
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Network:</span>
              <span className="text-sm text-muted-foreground">
                {value.value.network || 'Unknown'}
              </span>
            </div>
          </div>
        );
      }
      case 'link': {
        const value = resource as TypedResource<'link'>;
        return (
          <a
            href={value.value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:underline break-all"
            onClick={e => e.stopPropagation()}>
            {value.value.url}
            <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
          </a>
        );
      }
      case 'document': {
        const value = resource as TypedResource<'document'>;
        return (
          <div className="space-y-1">
            <p className="text-sm line-clamp-2">
              {value.value.documentUrl?.substring(0, 150) || 'No content'}
              {value.value.documentUrl && value.value.documentUrl.length > 150 ? '...' : ''}
            </p>
            {value.value.documentType && (
              <div className="text-xs text-muted-foreground">
                Document Type: {value.value.documentType}
              </div>
            )}
          </div>
        );
      }
      case 'text': {
        const value = resource as TypedResource<'text'>;
        return (
          <div className="space-y-1">
            <p className="text-sm line-clamp-2">{value.value.content}</p>
            {value.value.format && (
              <div className="text-xs text-muted-foreground">Format: {value.value.format}</div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick(resource);
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        noPreview ? 'pb-3' : 'pb-0',
        className
      )}
      onClick={handleClick}>
      <CardHeader className={cn(noPreview ? 'pb-2 border-none' : 'pb-0')}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ResourceIcon type={resource.type} />
              <CardTitle className="text-sm font-medium">{resource.name}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Added {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(getBadgeColor(resource.type), 'rounded-full')}>
              {getTypeLabel(resource.type)}
            </Badge>
            {onDelete && !disabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(resource.id);
                    }}>
                    <Trash className="h-3 w-3 text-muted-foreground text-xs" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete resource</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardHeader>
      {!noPreview && <CardContent className="pt-3">{renderPreview()}</CardContent>}
    </Card>
  );
}
