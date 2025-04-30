import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BRAND_LOGO_CONTRAST_URL } from '@/constants';

type Props = {
  imgSrc?: string;
  name?: string;
  width?: number;
  height?: number;
};

const AgentAvatar = ({ imgSrc, name, width, height }: Props) => {
  return (
    <Avatar style={{ width, height }}>
      <AvatarImage src={imgSrc || BRAND_LOGO_CONTRAST_URL} />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  );
};

export default AgentAvatar;
