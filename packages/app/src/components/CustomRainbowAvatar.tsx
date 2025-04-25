import { AvatarComponent } from '@rainbow-me/rainbowkit';
import { Atoms } from '@/ui';

export const CustomRainbowAvatar: AvatarComponent = ({ address, size, ensImage }) => {
  return ensImage ? (
    <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} />
  ) : (
    <Atoms.Avatar address={address as any} size={size} />
  );
};
