import { Database } from '@/types/database.types';
import { OrganizationTable } from './organization.types';

export type UserTable = Database['next_auth']['Tables']['users']['Row'];
export type UserInsert = Database['next_auth']['Tables']['users']['Insert'];
export type UserUpdate = Database['next_auth']['Tables']['users']['Update'];
export type AggregatedUser = UserTable & { organizations: OrganizationTable[] };
