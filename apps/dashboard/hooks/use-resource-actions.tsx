import { suiteCore } from '@/core/suite';
import { useState } from 'react';

import { ParsedResource, ResourceType } from '@getgrowly/core';

import { useDashboardState } from './use-dashboard';

export const useAgentResourceActions = () => {
  const { selectedAgent } = useDashboardState();
  const [resources, setResources] = useState<ParsedResource[]>(selectedAgent?.resources || []);
};

export const useResourceActions = () => {
  const [resources, setResources] = useState<ParsedResource[]>([]);

  const [resourceType, setResourceType] = useState<ResourceType>('document');
  // Form states
  const [contractAddress, setContractAddress] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractNetwork, setContractNetwork] = useState('ethereum');

  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const handleAddResource = async () => {
    if (!contractAddress || !contractName) return;

    const newResource = await suiteCore.db.resources.create({
      name: contractName,
      type: resourceType,
      value: contractAddress,
    });

    const updatedResources = [...resources, newResource as ParsedResource];
    setResources(updatedResources);
    handleReset(resourceType);
  };

  const handleReset = (resourceType: ResourceType) => {
    switch (resourceType) {
      case 'link':
        // Reset form
        setLinkUrl('');
        setLinkName('');
        break;
      case 'contract':
        // Reset form
        setContractAddress('');
        setContractName('');
        break;
      case 'document':
        // Reset form
        setDocumentName('');
        setDocumentContent('');
        setDocumentFile(null);
        break;
    }
  };

  const handleRemoveResource = (resourceId: string) => {
    const updatedResources = resources.filter(r => r.id !== resourceId);
    setResources(updatedResources);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      // If no name is provided, use the file name
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };

  return {
    resources,
    setResources,
    contractAddress,
    setContractAddress,
    contractName,
    setContractName,
    contractNetwork,
    setContractNetwork,
    linkUrl,
    setLinkUrl,
    linkName,
    setLinkName,
    documentName,
    setDocumentName,
    documentContent,
    setDocumentContent,
    documentFile,
    setDocumentFile,
    handleAddResource,
    handleRemoveResource,
    handleFileChange,
  };
};
