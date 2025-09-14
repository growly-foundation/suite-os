import { createPublicClient, getContract, http } from 'viem';
import { base, mainnet } from 'viem/chains';

const SUPPORTED_CHAINS = [base, mainnet];

// ERC165 ABI (for ERC721 / ERC1155)
const ERC165_ABI = [
  {
    name: 'supportsInterface',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    outputs: [{ type: 'bool' }],
  },
];

// Minimal ERC20 ABI
const ERC20_ABI = [
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
];

// ERC721 & ERC1155 interface IDs
const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

export async function detectAddressType(address: `0x${string}`, chainId: number): Promise<string> {
  const chain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  if (!chain) {
    throw new Error(`Chain ${chainId} is not supported`);
  }
  const client = createPublicClient({
    chain,
    transport: http(),
  });

  // Step 1: Check bytecode
  const bytecode = await client.getCode({ address });

  if (!bytecode || bytecode === '0x') {
    return 'Wallet (EOA)';
  }

  // Step 2: Try ERC165 (ERC721 / ERC1155)
  const contract165 = getContract({
    address,
    abi: ERC165_ABI,
    client,
  }) as any;

  try {
    if (await contract165.read.supportsInterface([ERC721_INTERFACE_ID])) {
      return 'ERC721';
    }
    if (await contract165.read.supportsInterface([ERC1155_INTERFACE_ID])) {
      return 'ERC1155';
    }
  } catch {
    // Not ERC165 compatible → probably ERC20
  }

  // Step 3: Try ERC20
  const contract20 = getContract({ address, abi: ERC20_ABI, client }) as any;
  try {
    await contract20.read.decimals();
    return 'ERC20';
  } catch {
    return 'Contract';
  }
}
