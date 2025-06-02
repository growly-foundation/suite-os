import { ParsedUser } from '@getgrowly/core';
import { RandomAvatar } from '@getgrowly/ui';

export const AppUserAvatarWithStatus = ({
  user,
  size = 40,
  ...props
}: { user: ParsedUser; size?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="relative" {...props}>
      <RandomAvatar address={user.address as any} size={size} />
      {user.online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
      )}
    </div>
  );
};
