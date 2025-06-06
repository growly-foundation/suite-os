import { dylan } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { useMemo } from 'react';

type Props = {
  email: string;
  size?: number;
};

export const AdminAvatar = ({ email, size = 20 }: Props) => {
  const adminAvatar = useMemo(
    () =>
      createAvatar(dylan, {
        size,
        seed: email,
        backgroundColor: ['#0052ff'],
        mood: ['happy', 'hopeful', 'superHappy'],
      }).toDataUri(),
    [email]
  );
  return (
    <div
      className="items-center flex justify-center flex-col text-black"
      style={{ width: size, height: size }}>
      <img src={adminAvatar} alt={email} className="h-full w-full rounded-full object-cover" />
    </div>
  );
};
