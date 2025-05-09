import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { AggregatedOrganization } from './organizations';

export type User = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
export type AggregatedUser = User & { organizations: AggregatedOrganization[] };
