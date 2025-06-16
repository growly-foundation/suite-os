'use client';

import { generateMockUsers } from '@/constants/mockUsers';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { ParsedUser } from '@getgrowly/core';
import { RandomAvatar, WalletAddress } from '@getgrowly/ui';

// Sample user personas for the floating avatars
const userPersonas: ParsedUser[] = generateMockUsers(8);

// Absolute positions in pixels to ensure visibility
const avatarPositions = [
  { top: 60, left: 60, rotate: 25 }, // top left
  { top: 60, right: 60, rotate: 25 }, // top right
  { top: 120, left: 150, rotate: -15 }, // middle left
  { top: 180, right: 120, rotate: -25 }, // middle right
  { top: 240, left: 240, rotate: 15 }, // bottom left
  { top: 300, right: 240, rotate: 5 }, // bottom right
  { top: 360, left: 360, rotate: 15 }, // bottom left
  { top: 420, right: 360, rotate: 5 }, // bottom right
];

export function FloatingAvatars() {
  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {userPersonas.map((user, index) => (
        <FloatingAvatar
          key={user.id}
          user={user}
          position={avatarPositions[index % avatarPositions.length]}
          delay={index * 0.5}
        />
      ))}
    </div>
  );
}

interface FloatingAvatarProps {
  user: ParsedUser;
  position: { top: number; left?: number; right?: number; rotate?: number };
  delay: number;
}

function FloatingAvatar({ user, position, delay }: FloatingAvatarProps) {
  return (
    <motion.div
      className="absolute pointer-events-auto md:block max-sm:hidden"
      style={position}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 0.9,
        y: [0, -15, 0, 15, 0],
      }}
      transition={{
        opacity: { duration: 1, delay },
        y: { repeat: Infinity, duration: 10 + Math.random() * 4, delay },
      }}>
      <motion.div
        className="relative group blur-sm hover:blur-none transition duration-300"
        whileHover={{ scale: 1.1 }}>
        <div
          className={cn(
            'rounded-md overflow-hidden bg-white backdrop-blur-md ring-2 ring-white/40 shadow-lg'
          )}>
          <RandomAvatar address={user.entities.walletAddress} size={65} />
        </div>
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-xl z-50 w-fit"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}>
          <WalletAddress
            address={user.entities.walletAddress}
            truncate
            truncateLength={{ startLength: 10, endLength: 4 }}
          />
          <p className="text-xs text-black/80">{user.description}</p>
          <p className="text-xs text-primary mb-1">{user.reputation.level}</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
