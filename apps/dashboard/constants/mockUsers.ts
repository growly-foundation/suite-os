import { faker } from '@faker-js/faker';

import { ParsedUser } from '@getgrowly/core';

// Helper functions for generating mock data
const generateEthAddress = (): `0x${string}` =>
  `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

const generateRandomDate = (start: Date, end: Date): string =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

const tokenSymbols = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'UNI', 'LINK', 'AAVE', 'MKR', 'SNX'];
const nftCollections = [
  'Bored Ape',
  'CryptoPunks',
  'Doodles',
  'Azuki',
  'CloneX',
  'Moonbirds',
  'Otherdeed',
  'Degen Ape',
  'Cool Cats',
  'World of Women',
];
const badgeLevels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
const activityTypes = ['send', 'receive', 'swap', 'vote'] as const;
const companies = [
  'Google',
  'Microsoft',
  'Amazon',
  'Apple',
  'Meta',
  'Netflix',
  'Tesla',
  'SpaceX',
  'OpenAI',
  'Coinbase',
  'Binance',
  'Uniswap',
  'Aave',
  'Compound',
  'MakerDAO',
];
const descriptions = [
  'Web3 enthusiast and blockchain developer',
  'Digital artist exploring NFT space',
  'DeFi yield farmer and liquidity provider',
  'Crypto trader and technical analyst',
  'Blockchain researcher and educator',
  'Smart contract auditor',
  'DAO contributor and governance participant',
  'NFT collector and curator',
  'Web3 product manager',
  'Crypto journalist and content creator',
];

const generateTokens = () => {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 tokens
  return Array.from({ length: count }, () => ({
    symbol: tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
    balance: Math.random() * 100,
    value: Math.random() * 10000,
    change24h: parseFloat((Math.random() * 20 - 10).toFixed(2)), // -10% to +10%
  }));
};

const generateRecentActivity = () => {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 activities
  return Array.from({ length: count }, (_, i) => {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const daysAgo = i + 1;
    return {
      type,
      description:
        `${type.charAt(0).toUpperCase() + type.slice(1)} ${type === 'vote' ? 'on proposal' : ''}`.trim(),
      timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.random() > 0.3 ? `$${(Math.random() * 1000).toFixed(2)}` : undefined,
    };
  });
};

const generateNFTs = () => {
  const count = Math.floor(Math.random() * 10); // 0-9 NFTs
  return Array.from({ length: count }, () => {
    const collection = nftCollections[Math.floor(Math.random() * nftCollections.length)];
    return {
      collection,
      name: `${collection} #${Math.floor(Math.random() * 10000)}`,
      image: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
    };
  });
};

const generateReputation = () => {
  const score = Math.floor(Math.random() * 1000);
  const level = badgeLevels[Math.floor(score / 200)] || badgeLevels[badgeLevels.length - 1];

  const badges = [];
  if (score > 100) badges.push('Early Adopter');
  if (score > 300) badges.push('Active Trader');
  if (score > 500) badges.push('Liquidity Provider');
  if (score > 700) badges.push('Governance Participant');
  if (score > 900) badges.push('Whale');

  return { score, level, badges };
};

export const generateMockUsers = (count: number): ParsedUser[] => {
  return Array.from({ length: count }, (_, i) => {
    const hasEns = Math.random() > 0.7; // 30% chance of having ENS
    const ensName = hasEns
      ? `${faker.internet
          .userName()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')}.eth`
      : undefined;

    const address = generateEthAddress();
    const hasAvatar = Math.random() > 0.5; // 50% chance of having an avatar
    const avatar = hasAvatar ? `https://i.pravatar.cc/150?u=${address}` : undefined;

    const isAnonymous = Math.random() > 0.8; // 20% chance of being anonymous
    const company = companies[Math.floor(Math.random() * companies.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const created_at = generateRandomDate(oneYearAgo, now);
    const lastMessageTime = generateRandomDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // within last 7 days
      now
    );

    const online = Math.random() > 0.7; // 30% chance of being online
    const unread = online ? Math.random() > 0.5 : false; // 50% chance of having unread messages if online

    const stats = {
      totalTransactions: Math.floor(Math.random() * 10000),
      totalVolume: Math.random() * 1000000,
      nftCount: Math.floor(Math.random() * 50),
      tokenCount: Math.floor(Math.random() * 20) + 1,
      daysActive: Math.floor(Math.random() * 365) + 1,
    };

    return {
      id: `user_${i + 1}`,
      created_at,
      entities: {
        walletAddress: address,
      },
      is_anonymous: isAnonymous ? true : null,
      name: faker.person.fullName(),
      image_url: avatar,
      original_joined_at: created_at,
      description,
      personaData: {
        portfolio_snapshots: {
          totalValue: Math.random() * 100000,
          tokenPortfolio: {
            chainRecordsWithTokens: {},
          },
        },
      },
    } as ParsedUser;
  });
};

// Generate 100 mock users
export const mockUsers = generateMockUsers(100);

// Export a few example users for testing
export const exampleUsers = mockUsers.slice(0, 5);
