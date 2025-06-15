import { getBadgeColor } from '@/lib/color.utils';
import { BadgeIcon } from 'lucide-react';

import { Badge } from '../ui/badge';

export const UserBadges = ({ badges, showAll }: { badges: string[]; showAll?: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      {badges.slice(0, showAll ? badges.length : 2).map((badge, i) => (
        <Badge key={i} className={getBadgeColor(badge)}>
          <BadgeIcon className="h-2 w-2 mr-1" /> {badge}
        </Badge>
      ))}
      {badges.length > 2 && !showAll && (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          +{badges.length - 2}
        </Badge>
      )}
    </div>
  );
};
