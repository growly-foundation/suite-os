import { makeGetContractAbiTool } from './features/get-contract-abi';
import { makeGetDocumentContentTool } from './features/get-document-content';
import { makeGetResourceDetailsTool } from './features/get-resource-details';
import { makeGetTextContentTool } from './features/get-text-content';
import { makeGetWebsiteContentTool } from './features/get-website-content';

export function makeResourceTools() {
  return {
    getResourceDetailsTool: makeGetResourceDetailsTool(),
    getWebsiteContentTool: makeGetWebsiteContentTool(),
    getContractAbiTool: makeGetContractAbiTool(),
    getDocumentContentTool: makeGetDocumentContentTool(),
    getTextContentTool: makeGetTextContentTool(),
  };
}

// Re-export the context management functions from the resource-details feature
export { getResourceContext, setResourceContext } from './features/get-resource-details';
