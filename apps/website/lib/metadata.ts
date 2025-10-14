import { Metadata } from 'next';

interface MetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

export function constructMetadata({
  title = 'Suite | AI-Powered Web3 Growth Platform | GetSuite.io',
  description = 'Suite is the leading AI-powered platform for Web3 growth. Understand user personas, get actionable insights, and scale your DeFi or NFT project with enterprise-grade analytics and AI agents.',
  path = '',
  image = '/banners/suite-banner-oil.png',
}: MetadataProps = {}): Metadata {
  const url = `https://getsuite.io${path}`;
  const imageUrl = image.startsWith('http') ? image : `https://getsuite.io${image}`;

  return {
    title,
    description,
    keywords: [
      'Web3 AI platform',
      'DeFi analytics',
      'NFT user insights',
      'blockchain analytics',
      'crypto user personas',
      'onchain data analysis',
      'Web3 growth platform',
      'AI agents for crypto',
      'blockchain user behavior',
      'DeFi user analytics',
      'NFT project analytics',
      'crypto marketing platform',
      'Web3 user insights',
      'blockchain growth tools',
      'crypto user personas',
      'DeFi user behavior',
      'NFT user analytics',
      'Web3 analytics platform',
      'crypto growth platform',
      'blockchain marketing tools',
    ].join(', '),
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
      siteName: 'Suite | AI-Powered Web3 Growth Platform',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - AI-Powered Web3 Growth Platform`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@GrowlySuite',
      site: '@GrowlySuite',
      images: [
        {
          url: imageUrl,
          alt: `${title} - AI-Powered Web3 Growth Platform`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code', // Add your Google Search Console verification code
    },
  };
}
