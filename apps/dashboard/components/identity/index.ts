// Main Identity component
export {
  Identity,
  IdentityCompact,
  IdentityFull,
  IdentityAvatarOnly,
  IdentityNameOnly,
  IdentitySimple,
} from './identity';
export type { IdentityProps } from './identity';

// Individual components
export { IdentityAvatar } from './identity-avatar';
export { IdentityName } from './identity-name';
export { IdentityWalletAddress } from './identity-wallet-address';
export { IdentityCheckmark } from './identity-checkmark';

// Context and hooks
export {
  IdentityProvider,
  useIdentityContext,
  useIdentity,
  useIdentityName,
  useIdentityAvatar,
} from './identity-context';
