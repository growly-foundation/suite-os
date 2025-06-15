// utils/color-utils.ts
export const generateColorFromString = (str: string, saturation = 80, lightness = 70) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate a hue between 0-360
  const hue = hash % 360;
  // Return HSL color with consistent saturation and lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Predefined badge color variants
export const BADGE_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
  'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
];

// Get a consistent color for a given string
export const getBadgeColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % BADGE_COLORS.length;
  return BADGE_COLORS[colorIndex];
};
