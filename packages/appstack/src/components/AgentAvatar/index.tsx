import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
  imgSrc?: string;
  name?: string;
  width?: number;
  height?: number;
};

const AgentAvatar = ({ imgSrc, name, width, height }: Props) => {
  return (
    <Avatar style={{ width, height }}>
      <AvatarImage src={imgSrc || '/logos/growly-contrast.png'} />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  );
};

export default AgentAvatar;
