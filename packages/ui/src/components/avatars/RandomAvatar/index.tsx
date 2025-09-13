import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { useMemo } from 'react';

type Props = {
  address: `0x${string}`;
  oneID?: string; // Special name service
  ensName?: string;
  ensAvatar?: string;
  size?: number;
};

export const RandomAvatar = ({ address, ensName, ensAvatar, size = 20 }: Props) => {
  const randomAvatar = useMemo(
    () =>
      createAvatar(glass, {
        seed: address,
        rotate: 10,
        scale: 200,
        backgroundColor: [
          '4747eb',
          '4762eb',
          '477eeb',
          '4799eb',
          '47b4eb',
          '47d0eb',
          '7e47eb',
          '6247eb',
          'b447eb',
          '9947eb',
          '47eb99',
          '47eb7e',
        ],
      }).toDataUri(),
    [address]
  );

  return (
    <div
      className="items-center flex justify-center flex-col text-black"
      style={{ width: size, height: size }}>
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt={ensName || address}
          className="h-full w-full overflow-hidden object-cover"
          style={{ borderRadius: '10px' }}
        />
      ) : (
        <img
          src={randomAvatar}
          alt={ensName || address}
          className="h-full w-full overflow-hidden object-cover"
          style={{ borderRadius: '10px' }}
        />
      )}
    </div>
  );
};
