import { PersonaTrait } from '@/types/persona';

// utils/color-utils.ts
export const generateColorFromString = (str: string, saturation = 80, lightness = 70) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate a hue between 0-360 with better distribution
  const hue = Math.abs(hash) % 360;
  // Return HSL color with consistent saturation and lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Predefined badge color variants
export const BADGE_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
  'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800',
];

// Get a consistent color for a given string with better hash distribution
export const getBadgeColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Use a better distribution algorithm to minimize collisions
  const colorIndex = Math.abs(hash) % BADGE_COLORS.length;
  return BADGE_COLORS[colorIndex];
};

export const getTraitColor = (trait: PersonaTrait) => {
  switch (trait) {
    case PersonaTrait.OG:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800';
    case PersonaTrait.DEFI_EXPERT:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800';
    case PersonaTrait.RISK_TAKER:
      return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800';
    case PersonaTrait.NEWBIE:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800';
    case PersonaTrait.IDLE:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800';
  }
};
