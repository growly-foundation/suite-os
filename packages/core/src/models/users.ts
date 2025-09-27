import { Tables } from '@/types/database.types';

import { Message } from './messages';
import { ParsedUserPersona } from './user_personas';

export type User = Tables<'users'>;

export enum UserSource {
  NATIVE = 'native', // Users who joined the app directly
  PRIVY_IMPORT = 'privy_import',
  CONTRACT_IMPORT = 'contract_import',
  NFT_HOLDERS_IMPORT = 'nft_holders_import',
  MANUAL_IMPORT = 'manual_import',
  GUILD_IMPORT = 'guild_import',
}

export type ParsedUser = User & {
  personaData: ParsedUserPersona;
  offchainData: UserOffchainData;
  chatSession: UserChatSession;
};

// TODO: Need to be fields in the database
export enum SessionStatus {
  Online = 'Online',
  Offline = 'Offline',
}

export type UserOffchainData = {
  company?: string;
  description?: string;
  // Additional fields for integration metadata
  source?: string; // Source of the user (privy, guildxyz, contract, etc.)
  sourceId?: string; // ID in the source system
  sourceData?: Record<string, any>; // Structured data from the source
  importedAt?: string; // When the user was imported
};

export type UserChatSession = {
  status: SessionStatus;
  unread: boolean;
};

export type LatestConversation = {
  conversationId: string;
  agentId: string;
  message: Message;
};
