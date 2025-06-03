import { Database, Tables } from '@/types/database.types';

export type Resource = Tables<'resources'>;
export type ResourceType = Database['public']['Enums']['resource_type'];
export type ParsedResource = Omit<Resource, 'value'> & ResourceValue;
export type ParsedResourceInsert = Omit<Resource, 'id' | 'created_at'> & ResourceValue;

/**
 * Value of the resource.
 */
export type ResourceValue = ContractResourceValue | LinkResourceValue;

/**
 * Contract resource value.
 */
export interface ContractResourceValue {
  type: 'contract';
  value: {
    address: string;
    network: string;
  };
}

/**
 * Link resource value.
 */
export interface LinkResourceValue {
  type: 'link';
  value: {
    url: string;
    included_path?: string;
    exclude_path?: string;
  };
}

/**
 * Document resource value.
 */
export interface DocumentResourceValue {
  type: 'document';
  value: {
    document_url: string;
  };
}
