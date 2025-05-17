import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNumberFromStr } from '@/lib/utils';

export const RandomAvatar = ({
  value,
  width = 40,
  height = 40,
}: {
  value: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Avatar style={{ width, height }} className="h-10 w-10 border-2 border-white/20 cursor-pointer">
      <AvatarImage src={`../random-avatars/random-avatar-${getNumberFromStr(value, 7)}.webp`} />
      <AvatarFallback>{value.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
