import { ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

// Network mapping for human-readable names
const getNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    42161: 'Arbitrum One',
    10: 'Optimism',
    8453: 'Base',
  };
  return networks[chainId] || `Chain ${chainId}`;
};

// Contract complexity analysis
const analyzeContractComplexity = (
  abi: any[]
): {
  complexity: 'Simple' | 'Moderate' | 'Complex' | 'Very Complex';
  score: number;
  factors: string[];
} => {
  const functions = abi.filter(item => item.type === 'function');
  const events = abi.filter(item => item.type === 'event');
  const writeFunctions = functions.filter(
    f => f.stateMutability !== 'view' && f.stateMutability !== 'pure'
  );

  let score = 0;
  const factors: string[] = [];

  // Function count scoring
  if (functions.length > 50) {
    score += 3;
    factors.push(`High function count (${functions.length})`);
  } else if (functions.length > 20) {
    score += 2;
    factors.push(`Moderate function count (${functions.length})`);
  } else if (functions.length > 10) {
    score += 1;
  }

  // Write function ratio
  const writeRatio = writeFunctions.length / functions.length;
  if (writeRatio > 0.7) {
    score += 2;
    factors.push('High write function ratio');
  }

  // Event complexity
  if (events.length > 20) {
    score += 1;
    factors.push(`Many events (${events.length})`);
  }

  // Parameter complexity
  const complexFunctions = functions.filter(f => f.inputs && f.inputs.length > 5).length;
  if (complexFunctions > 5) {
    score += 2;
    factors.push('Functions with many parameters');
  }

  // Determine complexity level
  let complexity: 'Simple' | 'Moderate' | 'Complex' | 'Very Complex';
  if (score >= 6) complexity = 'Very Complex';
  else if (score >= 4) complexity = 'Complex';
  else if (score >= 2) complexity = 'Moderate';
  else complexity = 'Simple';

  return { complexity, score, factors };
};

// Security pattern detection
const analyzeSecurityPatterns = (
  abi: any[]
): {
  patterns: string[];
  concerns: string[];
  score: number;
} => {
  const functions = abi.filter(item => item.type === 'function');
  const events = abi.filter(item => item.type === 'event');

  const patterns: string[] = [];
  const concerns: string[] = [];
  let score = 0;

  // Check for common security patterns
  const hasOwnership = functions.some(
    f => f.name?.toLowerCase().includes('owner') || f.name?.toLowerCase().includes('admin')
  );
  if (hasOwnership) {
    patterns.push('Ownership controls');
    score += 1;
  }

  const hasPause = functions.some(
    f => f.name?.toLowerCase().includes('pause') || f.name?.toLowerCase().includes('emergency')
  );
  if (hasPause) {
    patterns.push('Emergency pause mechanism');
    score += 1;
  }

  const hasReentrancy = functions.some(
    f => f.name?.toLowerCase().includes('nonreentrant') || f.name?.toLowerCase().includes('lock')
  );
  if (hasReentrancy) {
    patterns.push('Reentrancy protection');
    score += 1;
  }

  // Check for potential concerns
  const hasUpgrade = functions.some(
    f => f.name?.toLowerCase().includes('upgrade') || f.name?.toLowerCase().includes('implement')
  );
  if (hasUpgrade) {
    concerns.push('Upgradeable contract (proxy pattern detected)');
  }

  const hasDirectTransfer = functions.some(
    f => f.name?.toLowerCase().includes('transfer') && f.stateMutability === 'payable'
  );
  if (hasDirectTransfer) {
    concerns.push('Direct value transfer functions');
  }

  return { patterns, concerns, score };
};

// Function categorization and analysis
const categorizeFunctions = (
  abi: any[]
): {
  categories: Record<string, any[]>;
  insights: string[];
} => {
  const functions = abi.filter(item => item.type === 'function');
  const categories: Record<string, any[]> = {
    'Read Functions': [],
    'Write Functions': [],
    'Payable Functions': [],
    'Owner Functions': [],
    'Token Functions': [],
    'Utility Functions': [],
  };

  const insights: string[] = [];

  functions.forEach(func => {
    // Basic categorization
    if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
      categories['Read Functions'].push(func);
    } else {
      categories['Write Functions'].push(func);
    }

    if (func.stateMutability === 'payable') {
      categories['Payable Functions'].push(func);
    }

    // Semantic categorization
    const name = func.name?.toLowerCase() || '';

    if (name.includes('owner') || name.includes('admin') || name.includes('governance')) {
      categories['Owner Functions'].push(func);
    }

    if (
      name.includes('transfer') ||
      name.includes('approve') ||
      name.includes('allowance') ||
      name.includes('balance') ||
      name.includes('mint') ||
      name.includes('burn')
    ) {
      categories['Token Functions'].push(func);
    }

    if (
      name.includes('get') ||
      name.includes('calculate') ||
      name.includes('check') ||
      name.includes('is') ||
      name.includes('has')
    ) {
      categories['Utility Functions'].push(func);
    }
  });

  // Generate insights
  if (categories['Token Functions'].length > 5) {
    insights.push('Appears to be a token contract (ERC-20/ERC-721/ERC-1155)');
  }

  if (categories['Owner Functions'].length > 3) {
    insights.push('Has significant administrative controls');
  }

  if (categories['Payable Functions'].length > 0) {
    insights.push(`Can receive ETH through ${categories['Payable Functions'].length} functions`);
  }

  const readWriteRatio = categories['Read Functions'].length / categories['Write Functions'].length;
  if (readWriteRatio > 2) {
    insights.push('Read-heavy contract (likely a data contract or oracle)');
  } else if (readWriteRatio < 0.5) {
    insights.push('Write-heavy contract (likely interactive/transactional)');
  }

  return { categories, insights };
};

export const getContractAbiToolFn =
  () =>
  async (args: {
    resourceId: string;
    functionName?: string;
    includeMetrics?: boolean;
  }): Promise<ToolOutputValue[]> => {
    const { resourceId, functionName, includeMetrics = true } = args;

    const resources = getResourceContext();
    if (!resources || resources.length === 0) {
      return [
        {
          type: 'system:error',
          content: 'No resources available. Please ensure resources are properly configured.',
        },
      ];
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      const availableIds = resources.map(r => r.id).join(', ');
      return [
        {
          type: 'system:error',
          content: `Resource with ID "${resourceId}" not found. Available resources: ${availableIds}`,
        },
      ];
    }

    if (resource.type !== 'contract') {
      return [
        {
          type: 'system:error',
          content: `Resource "${resourceId}" is not a contract resource. Use get_website_content for websites, get_document_content for documents, or get_text_content for text.`,
        },
      ];
    }

    const contractValue = resource.value;
    if (!contractValue?.address) {
      return [
        {
          type: 'system:error',
          content: `Contract resource "${resourceId}" is missing address information.`,
        },
      ];
    }

    if (!contractValue.abi) {
      return [
        {
          type: 'text',
          content: `**Contract Information:**
- **Address:** ${contractValue.address}
- **Network:** ${getNetworkName(contractValue.chainId || 1)}
- **ABI Status:** Not available

The contract ABI is not available for this resource. You may need to:
1. Verify the contract on the blockchain explorer
2. Add the ABI manually to the resource
3. Use a contract verification service`,
        },
      ];
    }

    const abi = contractValue.abi;
    let response = `**Smart Contract Analysis**\n`;
    response += `- **Address:** ${contractValue.address}\n`;
    response += `- **Network:** ${getNetworkName(contractValue.chainId || 1)}\n\n`;

    if (functionName) {
      // Specific function analysis
      const targetFunction = abi.find(
        (item: any) =>
          item.type === 'function' && item.name?.toLowerCase() === functionName.toLowerCase()
      );

      if (!targetFunction) {
        const availableFunctions = abi
          .filter((item: any) => item.type === 'function')
          .map((f: any) => f.name)
          .filter(Boolean)
          .slice(0, 10);

        return [
          {
            type: 'text',
            content: `Function "${functionName}" not found in contract ABI.\n\n**Available functions:**\n${availableFunctions.map(name => `- ${name}`).join('\n')}${availableFunctions.length === 10 ? '\n... and more' : ''}`,
          },
        ];
      }

      response += `**Function: ${targetFunction.name}**\n\n`;
      response += `- **Type:** ${targetFunction.stateMutability === 'view' || targetFunction.stateMutability === 'pure' ? 'Read' : 'Write'} Function\n`;
      response += `- **State Mutability:** ${targetFunction.stateMutability || 'nonpayable'}\n`;

      if (targetFunction.inputs && targetFunction.inputs.length > 0) {
        response += `\n**Parameters:**\n`;
        targetFunction.inputs.forEach((input: any, index: number) => {
          response += `${index + 1}. \`${input.name || `param${index}`}\`: ${input.type}\n`;
        });
      } else {
        response += `\n**Parameters:** None\n`;
      }

      if (targetFunction.outputs && targetFunction.outputs.length > 0) {
        response += `\n**Returns:**\n`;
        targetFunction.outputs.forEach((output: any, index: number) => {
          response += `${index + 1}. \`${output.name || `return${index}`}\`: ${output.type}\n`;
        });
      }

      // Add function purpose analysis
      const name = targetFunction.name.toLowerCase();
      let purpose = 'General contract function';

      if (name.includes('transfer') || name.includes('send')) {
        purpose = 'Token/value transfer function';
      } else if (name.includes('approve') || name.includes('allowance')) {
        purpose = 'Token approval/permission function';
      } else if (name.includes('mint') || name.includes('create')) {
        purpose = 'Asset creation function';
      } else if (name.includes('burn') || name.includes('destroy')) {
        purpose = 'Asset destruction function';
      } else if (name.includes('owner') || name.includes('admin')) {
        purpose = 'Administrative/governance function';
      } else if (name.includes('get') || name.includes('view') || name.includes('read')) {
        purpose = 'Data retrieval function';
      } else if (name.includes('set') || name.includes('update') || name.includes('change')) {
        purpose = 'State modification function';
      }

      response += `\n**Purpose:** ${purpose}\n`;
    } else {
      // Comprehensive contract analysis
      const functions = abi.filter((item: any) => item.type === 'function');
      const events = abi.filter((item: any) => item.type === 'event');
      const ctorFunction = abi.find((item: any) => item.type === 'constructor');

      if (functions.length === 0) {
        response += 'No functions found in the contract ABI.';
      } else {
        // Basic metrics
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

        if (includeMetrics) {
          // Complexity analysis
          const complexity = analyzeContractComplexity(abi);
          response += `**Complexity Analysis:**\n`;
          response += `- **Level:** ${complexity.complexity} (Score: ${complexity.score})\n`;
          if (complexity.factors.length > 0) {
            response += `- **Factors:** ${complexity.factors.join(', ')}\n`;
          }
          response += `\n`;

          // Security analysis
          const security = analyzeSecurityPatterns(abi);
          response += `**Security Analysis:**\n`;
          if (security.patterns.length > 0) {
            response += `- **Security Patterns:** ${security.patterns.join(', ')}\n`;
          }
          if (security.concerns.length > 0) {
            response += `- **Potential Concerns:** ${security.concerns.join(', ')}\n`;
          }
          response += `- **Security Score:** ${security.score}/3\n\n`;

          // Function categorization
          const categorization = categorizeFunctions(abi);
          response += `**Contract Insights:**\n`;
          categorization.insights.forEach(insight => {
            response += `- ${insight}\n`;
          });
          response += `\n`;

          // Category breakdown
          response += `**Function Categories:**\n`;
          Object.entries(categorization.categories).forEach(([category, funcs]) => {
            if (funcs.length > 0) {
              response += `- **${category}:** ${funcs.length} functions\n`;
            }
          });
          response += `\n`;
        }

        // Sample functions
        if (writeFunctions.length > 0) {
          response += `**Key Write Functions:**\n`;
          writeFunctions.slice(0, 5).forEach((func: any) => {
            const paramCount = func.inputs ? func.inputs.length : 0;
            const payable = func.stateMutability === 'payable' ? ' (payable)' : '';
            response += `- \`${func.name}\`(${paramCount} params)${payable}\n`;
          });
          if (writeFunctions.length > 5) {
            response += `... and ${writeFunctions.length - 5} more write functions\n`;
          }
          response += `\n`;
        }

        if (viewFunctions.length > 0) {
          response += `**Key View Functions:**\n`;
          viewFunctions.slice(0, 5).forEach((func: any) => {
            const paramCount = func.inputs ? func.inputs.length : 0;
            response += `- \`${func.name}\`(${paramCount} params)\n`;
          });
          if (viewFunctions.length > 5) {
            response += `... and ${viewFunctions.length - 5} more view functions\n`;
          }
          response += `\n`;
        }

        // Constructor info
        if (ctorFunction) {
          response += `**Constructor:**\n`;
          if (ctorFunction.inputs && ctorFunction.inputs.length > 0) {
            response += `- **Inputs:**\n`;
            ctorFunction.inputs.forEach((input: any, index: number) => {
              response += `  ${index + 1}. \`${input.name || `param${index}`}\`: ${input.type}\n`;
            });
          } else {
            response += `- **Inputs:** None\n`;
          }
          response += `\n`;
        }

        response += `**Usage:** Use \`get_contract_abi\` with \`functionName\` parameter to get detailed information about any specific function.`;
      }
    }

    return [
      {
        type: 'text',
        content: response,
      },
    ];
  };
