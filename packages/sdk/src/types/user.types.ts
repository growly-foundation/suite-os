import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { AggregatedOrganization } from './organization.types';

export type UserTable = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
export type AggregatedUser = UserTable & { organizations: AggregatedOrganization[] };
