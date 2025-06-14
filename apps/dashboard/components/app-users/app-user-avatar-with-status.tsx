import { ParsedUser } from '@getgrowly/core';
import { RandomAvatar } from '@getgrowly/ui';

export const AppUserAvatarWithStatus = ({
  user,
  withStatus = true,
  size = 40,
  ...props
}: {
  user: ParsedUser;
  withStatus?: boolean;
  size?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="relative" {...props}>
      <RandomAvatar address={user.address as any} size={size} ensAvatar={user.avatar} />
      {withStatus && user.online && (
        <span
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white`}></span>
      )}
    </div>
  );
};
