import { Database, Tables } from '@/types/database.types';

export type UserPersona = Tables<'user_personas'>;
export type ExtendedUserPersona = {
  identities: {
    // External data
    talentProtocol?: any;
    guildXyz?: any;
    // Add more identities here
  };
  activities: {
    // TODO: Add activities
  };
  portfolio_snapshots: {
    // TODO: Add portfolio snapshots
  };
};
export type ParsedUserPersona = UserPersona & ExtendedUserPersona;
export type UserPersonaStatus = Database['public']['Enums']['sync_status'];
