import { Tables } from '@/types/database.types';

export type UserPersona = Tables<'user_personas'>;

export type ParsedUserPersona = UserPersona & {
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
