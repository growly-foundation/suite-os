import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const text = {
  base: 'gas-font-family',
  body: 'gas-font-family gas-font-normal gas-text-base',
  caption: 'gas-font-family gas-font-semibold gas-text-xs',
  headline: 'gas-font-family gas-font-semibold',
  label1: 'gas-font-family gas-font-semibold gas-text-sm',
  label2: 'gas-font-family gas-text-sm',
  legal: 'gas-font-family gas-text-xs',
  title1: 'gas-font-family gas-font-semibold gas-text-2xl',
  title2: 'gas-font-family gas-font-semibold gas-text-xl',
  title3: 'gas-font-family gas-font-semibold gas-text-lg',
} as const;

export const pressable = {
  default:
    'cursor-pointer gas-bg-default active:gas-bg-[var(--gas-bg-default-active)] hover:gas-bg-[var(--gas-bg-default-hover)]',
  alternate:
    'cursor-pointer gas-bg-alternate active:gas-bg-[var(--gas-bg-alternate-active)] hover:gas-bg-[var(--gas-bg-alternate-hover)]',
  inverse:
    'cursor-pointer gas-bg-inverse active:gas-bg-[var(--gas-bg-inverse-active)] hover:gas-bg-[var(--gas-bg-inverse-hover)]',
  primary:
    'cursor-pointer gas-bg-primary active:gas-bg-[var(--gas-bg-primary-active)] hover:gas-bg-[var(--gas-bg-primary-hover)]',
  secondary:
    'cursor-pointer gas-bg-secondary active:gas-bg-[var(--gas-bg-secondary-active)] hover:gas-bg-[var(--gas-bg-secondary-hover)]',
  coinbaseBranding: 'cursor-pointer gas-bg-[#0052FF] hover:gas-bg-[#0045D8]',
  shadow: 'gas-shadow-default',
  disabled: 'gas-opacity-[0.38] gas-pointer-events-none',
} as const;

export const background = {
  default: 'gas-bg-default',
  alternate: 'gas-bg-alternate',
  inverse: 'gas-bg-inverse',
  primary: 'gas-bg-primary',
  secondary: 'gas-bg-secondary',
  error: 'gas-bg-error',
  warning: 'gas-bg-warning',
  success: 'gas-bg-success',
  washed: 'gas-bg-primary-washed',
  disabled: 'gas-bg-primary-disabled',
  reverse: 'gas-bg-default-reverse',
} as const;

export const color = {
  inverse: 'gas-text-inverse',
  foreground: 'gas-text-foreground',
  foregroundMuted: 'gas-text-foreground-muted',
  error: 'gas-text-error',
  primary: 'gas-text-primary',
  success: 'gas-text-success',
  warning: 'gas-text-warning',
  disabled: 'gas-text-disabled',
} as const;

export const fill = {
  default: 'gas-fill-default',
  defaultReverse: 'gas-fill-default-reverse',
  inverse: 'gas-fill-inverse',
  alternate: 'gas-fill-alternate',
} as const;

export const border = {
  default: 'gas-border-default',
  defaultActive: 'gas-border-default-active',
  linePrimary: 'gas-border-line-primary',
  lineDefault: 'gas-border-line-default',
  lineHeavy: 'gas-border-line-heavy',
  lineInverse: 'gas-border-line-inverse',
  radius: 'gas-border-radius',
  radiusInner: 'gas-border-radius-inner',
} as const;

export const placeholder = {
  default: 'gas-placeholder-default',
} as const;

export const icon = {
  primary: 'gas-icon-color-primary',
  foreground: 'gas-icon-color-foreground',
  foregroundMuted: 'gas-icon-color-foreground-muted',
  inverse: 'gas-icon-color-inverse',
  error: 'gas-icon-color-error',
  success: 'gas-icon-color-success',
  warning: 'gas-icon-color-warning',
} as const;
