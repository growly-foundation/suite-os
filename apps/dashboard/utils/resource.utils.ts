import { ResourceType, TypedResource } from '@getgrowly/core';

export const isTextResource = (
  resource: TypedResource<ResourceType>
): resource is TypedResource<'text'> => {
  return resource.type === 'text';
};

export const isDocumentResource = (
  resource: TypedResource<ResourceType>
): resource is TypedResource<'document'> => {
  return resource.type === 'document';
};

export const isLinkResource = (
  resource: TypedResource<ResourceType>
): resource is TypedResource<'link'> => {
  return resource.type === 'link';
};

export const isContractResource = (
  resource: TypedResource<ResourceType>
): resource is TypedResource<'contract'> => {
  return resource.type === 'contract';
};
