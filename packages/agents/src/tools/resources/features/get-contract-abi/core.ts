import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

// Get network name for better display
const getNetworkName = (networkId: number): string => {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    56: 'BSC',
    43114: 'Avalanche',
    42161: 'Arbitrum One',
    10: 'Optimism',
  };
  return networks[networkId] || `Network ${networkId}`;
};

export const getContractAbiToolFn: ToolFn =
  () =>
  async ({
    resourceId,
    functionName,
  }: {
    resourceId: string;
    functionName?: string;
  }): Promise<ToolOutputValue[]> => {
    const resources = getResourceContext();

    if (resources.length === 0) {
      return [
        {
          type: 'text',
          content:
            'No resources are currently available. Please ensure resources are properly attached to this agent.',
        },
      ];
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      const availableIds = resources.map(r => `${r.name} (${r.id})`).join(', ');
      return [
        {
          type: 'text',
          content: `Resource with ID "${resourceId}" not found. Available resources: ${availableIds}`,
        },
      ];
    }

    if (resource.type !== 'contract') {
      return [
        {
          type: 'text',
          content: `Resource "${resource.name}" is not a contract resource (type: ${resource.type}). Use the appropriate tool for this resource type.`,
        },
      ];
    }

    const contractValue = resource.value;
    const address = contractValue.address;
    const network = contractValue.network;
    const abi = contractValue.abi;

    if (!address) {
      return [
        {
          type: 'text',
          content: `Contract resource "${resource.name}" does not have a valid address.`,
        },
      ];
    }

    let response = `**Contract: ${resource.name}**\n- Address: \`${address}\`\n- Network: ${getNetworkName(network)}\n\n`;

    if (!abi || !Array.isArray(abi)) {
      response +=
        '**Note**: No ABI is available for this contract. Cannot provide function details.';
      return [
        {
          type: 'text',
          content: response,
        },
      ];
    }

    if (functionName) {
      // Find specific function (case-insensitive)
      const functionAbi = abi.find(
        (item: any) =>
          item.type === 'function' && item.name?.toLowerCase() === functionName.toLowerCase()
      );

      if (!functionAbi) {
        const availableFunctions = abi
          .filter((item: any) => item.type === 'function')
          .map((item: any) => item.name)
          .filter(Boolean)
          .slice(0, 10); // Show first 10 functions

        response += `Function "${functionName}" not found in the contract ABI.`;
        if (availableFunctions.length > 0) {
          response += `\n\n**Available functions:** ${availableFunctions.join(', ')}`;
          if (abi.filter((item: any) => item.type === 'function').length > 10) {
            response += ' (and more...)';
          }
        }
      } else {
        response += `**Function: ${functionAbi.name}**\n`;
        response += `- Type: ${functionAbi.stateMutability || 'nonpayable'}\n`;

        if (functionAbi.inputs && functionAbi.inputs.length > 0) {
          response += `- **Inputs:**\n`;
          functionAbi.inputs.forEach((input: any, index: number) => {
            response += `  ${index + 1}. \`${input.name || `param${index}`}\`: ${input.type}\n`;
          });
        } else {
          response += `- **Inputs:** None\n`;
        }

        if (functionAbi.outputs && functionAbi.outputs.length > 0) {
          response += `- **Outputs:**\n`;
          functionAbi.outputs.forEach((output: any, index: number) => {
            response += `  ${index + 1}. \`${output.name || `output${index}`}\`: ${output.type}\n`;
          });
        } else {
          response += `- **Outputs:** None\n`;
        }
      }
    } else {
      // Return all functions with categorization
      const functions = abi.filter((item: any) => item.type === 'function');
      const events = abi.filter((item: any) => item.type === 'event');
      const ctorFunction = abi.find((item: any) => item.type === 'constructor');

      if (functions.length === 0) {
        response += 'No functions found in the contract ABI.';
      } else {
        // Categorize functions by mutability
        const viewFunctions = functions.filter(
          (f: any) => f.stateMutability === 'view' || f.stateMutability === 'pure'
        );
        const writeFunctions = functions.filter(
          (f: any) => f.stateMutability !== 'view' && f.stateMutability !== 'pure'
        );

        response += `**Contract Overview:**\n`;
        response += `- Total Functions: ${functions.length}\n`;
        response += `- View/Pure Functions: ${viewFunctions.length}\n`;
        response += `- Write Functions: ${writeFunctions.length}\n`;
        response += `- Events: ${events.length}\n\n`;

        if (writeFunctions.length > 0) {
          response += `**Write Functions (${writeFunctions.length}):**\n`;
          writeFunctions.slice(0, 10).forEach((func: any, index: number) => {
            const inputTypes = func.inputs?.map((input: any) => input.type).join(', ') || 'none';
            response += `${index + 1}. \`${func.name}\`(${inputTypes})\n`;
          });
          if (writeFunctions.length > 10) {
            response += `... and ${writeFunctions.length - 10} more write functions\n`;
          }
          response += '\n';
        }

        if (viewFunctions.length > 0) {
          response += `**View/Pure Functions (${viewFunctions.length}):**\n`;
          viewFunctions.slice(0, 10).forEach((func: any, index: number) => {
            const inputTypes = func.inputs?.map((input: any) => input.type).join(', ') || 'none';
            response += `${index + 1}. \`${func.name}\`(${inputTypes})\n`;
          });
          if (viewFunctions.length > 10) {
            response += `... and ${viewFunctions.length - 10} more view functions\n`;
          }
        }

        // Check for constructor
        if (ctorFunction) {
          response += `\n**Constructor:**\n`;
          if (ctorFunction.inputs && ctorFunction.inputs.length > 0) {
            response += `- **Inputs:**\n`;
            ctorFunction.inputs.forEach((input: any, index: number) => {
              response += `  ${index + 1}. \`${input.name || `param${index}`}\`: ${input.type}\n`;
            });
          } else {
            response += `- **Inputs:** None\n`;
          }
        }

        response += `\n**Usage:** Use \`get_contract_abi\` with \`functionName\` parameter to get detailed information about any specific function.`;
      }
    }

    return [
      {
        type: 'text',
        content: response,
      },
    ];
  };
