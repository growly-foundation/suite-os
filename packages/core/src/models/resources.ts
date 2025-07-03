import { Tables } from '@/types/database.types';

import { SupportedNetwork } from './chain';

export type Resource = Tables<'resources'>;
export type ResourceType = 'text' | 'contract' | 'link' | 'document';
export type ResourceValue =
  | TypedResource<'text'>
  | TypedResource<'contract'>
  | TypedResource<'link'>
  | TypedResource<'document'>;
export type ParsedResource = Omit<Resource, 'value'> & ResourceValue;
export type ParsedResourceInsert = Omit<Resource, 'id' | 'created_at'> & ResourceValue;
export type TypedResource<T extends ResourceType> = Omit<Resource, 'value'> & TypedResourceValue<T>;
export type TypedResourceValue<T extends ResourceType> = {
  type: T;
  value: T extends keyof ResourceMap ? ResourceMap[T] : never;
};

type ContractValue = {
  address: string;
  network: SupportedNetwork;
  abi?: any;
};

type LinkValue = {
  url: string;
  title?: string;
};

type DocumentValue = {
  documentUrl: string;
  documentType: 'pdf' | 'docx' | 'csv' | 'txt';
};

type TextValue = {
  content: string;
  format?: 'plain' | 'markdown' | 'html';
};

type ResourceMap = {
  contract: ContractValue;
  link: LinkValue;
  document: DocumentValue;
  text: TextValue;
};
