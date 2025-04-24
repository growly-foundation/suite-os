import { thumbs } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Avatar } from '@radix-ui/themes';
import { TAddress } from 'chainsmith-sdk/types';

type Props = {
  address: TAddress;
  size: number;
};

export default ({ address, size }: Props) => {
  const randomAvatar = createAvatar(thumbs, {
    size,
    seed: address,
    rotate: 60,
    backgroundColor: [
      '0a5b83',
      '1c799f',
      '69d2e7',
      'b6e3f4',
      'c0aede',
      'd1d4f9',
      'f1f4dc',
      'ffd5dc',
      'ffdfbf',
    ],
    backgroundType: ['solid', 'gradientLinear'],
    eyesColor: ['ffffff'],
    mouthColor: ['ffffff'],
    shapeColor: ['0a5b83', '1c799f', '69d2e7'],
  }).toDataUri();

  return <Avatar className="rounded-2xl" src={randomAvatar} fallback={address} />;
};
