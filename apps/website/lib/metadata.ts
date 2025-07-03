import { Metadata } from 'next';

interface MetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

export function constructMetadata({
  title = 'Suite | Create Growth That Lasts.',
  description = 'Powerful enterprise-grade AI platform with onchain persona analysis, intent suggestions, and customizable agents for businesses and DApps. Secure knowledge base with MCP server support.',
  path = '',
  image = '/banners/suite-preview-banner.png',
}: MetadataProps = {}): Metadata {
  const url = `https://getsuite.io${path}`;
  const imageUrl = image.startsWith('http') ? image : `https://getsuite.io${image}`;

  return {
    title,
    description,
    keywords:
      'Web3 AI solutions, DeFi AI platform, onchain persona analysis, secure AI services, intent suggestions, knowledge base management, AI agents for businesses and DApps, Ethereum wallet insights',
    authors: [{ name: 'Growly Team' }],
    creator: 'Growly',
    publisher: 'Growly',
    metadataBase: new URL('https://getsuite.io'),
    alternates: {
      canonical: url,
      languages: {
        'en-US': `https://getsuite.io/en-us${path}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title,
      description,
      siteName: 'Suite | Create Growth That Lasts.',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - Create Growth That Lasts.`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@getgrowly',
      images: [
        {
          url: imageUrl,
          alt: `${title} - Create Growth That Lasts.`,
        },
      ],
    },
  };
}
