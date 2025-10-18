import type { DocumentationArticle } from '@/components/dashboard/documentation-feed';

/**
 * Service for fetching and managing documentation articles
 * Currently uses a curated list, but can be extended to fetch from:
 * - Intercom Articles API
 * - RSS Feed
 * - Custom CMS
 */

// Curated articles from Suite documentation
export const DOCUMENTATION_ARTICLES: DocumentationArticle[] = [
  {
    id: '1',
    title: 'Suite Installation Guide for Browser Widget',
    description:
      'Quick guide to walk you through how to set up your organization and start integrating Suite into your application.',
    url: 'https://intercom.help/growly-suite/en/articles/11975841-suite-installation-guide-for-browser-widget',
    category: 'Integration',
    isNew: true,
    publishedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Import and manage Privy users',
    description:
      'With Privy integration, Suite users can seamlessly manage their activities and on-chain data directly from the Suite dashboard.',
    url: 'https://docs.getsuite.io/en/articles/14174089-import-and-manage-privy-users',
    category: 'Integration',
    isNew: true,
    publishedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Getting Started with Suite',
    description:
      'Learn the basics of Suite and how to create your first AI agent for Web3 customer success.',
    url: 'https://docs.getsuite.io',
    category: 'Getting Started',
    publishedAt: '2024-01-01',
  },
  {
    id: '4',
    title: 'Managing On-chain Users',
    description:
      'Understand your on-chain users, track their activities, and gain valuable insights.',
    url: 'https://docs.getsuite.io',
    category: 'Users',
    publishedAt: '2024-01-01',
  },
  {
    id: '5',
    title: 'Creating AI Agents for Web3',
    description:
      'Build intelligent agents that understand and respond to your users on-chain activities.',
    url: 'https://docs.getsuite.io',
    category: 'Agents',
    publishedAt: '2023-12-15',
  },
  {
    id: '6',
    title: 'Resource Management Best Practices',
    description:
      'Learn how to organize and optimize your knowledge base resources for better agent performance.',
    url: 'https://docs.getsuite.io',
    category: 'Resources',
    publishedAt: '2023-12-10',
  },
];

/**
 * Fetch documentation articles
 * @param limit - Maximum number of articles to return
 * @returns Promise with array of documentation articles
 */
export async function fetchDocumentationArticles(limit?: number): Promise<DocumentationArticle[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const articles = DOCUMENTATION_ARTICLES;

  if (limit) {
    return articles.slice(0, limit);
  }

  return articles;
}

/**
 * Fetch a single documentation article by ID
 * @param id - Article ID
 * @returns Promise with documentation article or null
 */
export async function fetchDocumentationArticle(id: string): Promise<DocumentationArticle | null> {
  await new Promise(resolve => setTimeout(resolve, 100));

  return DOCUMENTATION_ARTICLES.find(article => article.id === id) || null;
}

/**
 * Fetch articles by category
 * @param category - Category to filter by
 * @returns Promise with array of documentation articles
 */
export async function fetchArticlesByCategory(category: string): Promise<DocumentationArticle[]> {
  await new Promise(resolve => setTimeout(resolve, 100));

  return DOCUMENTATION_ARTICLES.filter(
    article => article.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get unique categories from all articles
 * @returns Array of unique category names
 */
export function getArticleCategories(): string[] {
  const categories = DOCUMENTATION_ARTICLES.map(article => article.category);
  return Array.from(new Set(categories));
}

// Future integration guide:
// To integrate with Intercom Articles API:
// 1. Get your Intercom Access Token
// 2. Use the Intercom API endpoint: https://api.intercom.io/articles
// 3. Replace the fetchDocumentationArticles function with:
//
// export async function fetchDocumentationArticles(limit?: number) {
//   const response = await fetch('https://api.intercom.io/articles', {
//     headers: {
//       'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
//       'Accept': 'application/json',
//     },
//   });
//   const data = await response.json();
//   return data.articles.slice(0, limit);
// }
