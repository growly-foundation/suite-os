import { Tables, TablesInsert } from '@/types/database.types';

import { SupportedNetwork } from './chain';

export type Resource = Tables<'resources'>;
export type ResourceInsert = TablesInsert<'resources'>;
export type ResourceType = 'text' | 'contract' | 'link' | 'document';
export type ResourceValue =
  | TypedResource<'text'>
  | TypedResource<'contract'>
  | TypedResource<'link'>
  | TypedResource<'document'>;
export type ParsedResource = Omit<Resource, 'value'> & ResourceValue;
export type ParsedResourceInsert = Omit<
  ResourceInsert,
  'value' | 'created_at' | 'id' | 'updated_at'
> &
  ResourceValue;
export type TypedResource<T extends ResourceType> = Omit<Resource, 'value'> & TypedResourceValue<T>;
export type TypedResourceValue<T extends ResourceType> = {
  type: T;
  value: T extends keyof ResourceMap ? ResourceMap[T] : never;
};

export type ContractValue = {
  address: string;
  network: SupportedNetwork;
  abi?: any;
};

export type LinkValue = {
  url: string;
  description?: string;
};

export type DocumentValue = {
  documentUrl: string;
  documentName: string;
  documentType: 'pdf' | 'docx' | 'csv' | 'txt';
  documentSize: number;
};

export type TextValue = {
  content: string;
  format?: 'plain' | 'markdown';
};

export type ResourceMap = {
  contract: ContractValue;
  link: LinkValue;
  document: DocumentValue;
  text: TextValue;
};
