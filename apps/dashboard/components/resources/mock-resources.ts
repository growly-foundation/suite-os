import { ResourceType, TypedResource } from '@getgrowly/core';

export const mockResources: TypedResource<ResourceType>[] = [
  {
    id: '1',
    name: 'Ethereum Contract',
    type: 'contract',
    status: 'active',
    created_at: '2023-06-15T10:30:00Z',
    organization_id: 'org-123',
    value: {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      network: 'ethereum',
      abi: [],
    },
  },
  {
    id: '2',
    name: 'Project Documentation',
    type: 'document',
    status: 'active',
    created_at: '2023-06-20T14:45:00Z',
    organization_id: 'org-123',
    value: {
      documentUrl: 'https://ethereum.org/en/developers/docs/',
      documentType: 'pdf',
    },
  },
  {
    id: '3',
    name: 'API Documentation',
    type: 'link',
    status: 'active',
    created_at: '2023-06-25T09:15:00Z',
    organization_id: 'org-123',
    value: {
      url: 'https://ethereum.org/en/developers/docs/',
      title: 'Ethereum Developer Documentation',
    },
  },
  {
    id: '4',
    name: 'Quick Notes',
    type: 'document',
    status: 'active',
    created_at: '2023-07-01T11:20:00Z',
    organization_id: 'org-123',
    value: {
      documentUrl: 'https://ethereum.org/en/developers/docs/',
      documentType: 'pdf',
    },
  },
  {
    id: '5',
    name: 'API Keys',
    type: 'document',
    status: 'active',
    created_at: '2023-07-05T16:30:00Z',
    organization_id: 'org-123',
    value: {
      documentUrl: 'https://ethereum.org/en/developers/docs/',
      documentType: 'pdf',
    },
  },
];
