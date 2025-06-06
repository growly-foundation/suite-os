import { dylan } from '@dicebear/collection';
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
      createAvatar(dylan, {
        size,
        seed: address,
        backgroundColor: ['#0052ff'],
        mood: ['happy', 'hopeful', 'superHappy'],
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
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <img
          src={randomAvatar}
          alt={ensName || address}
          className="h-full w-full rounded-full object-cover"
        />
      )}
    </div>
  );
};
