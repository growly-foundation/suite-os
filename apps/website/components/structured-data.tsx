export function StructuredData() {
  // Main software application schema
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Growly Suite',
    applicationCategory: 'BusinessApplication, AIApplication, Web3Application',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
    },
    description:
      'Enterprise AI platform with onchain persona analysis, intent suggestions, and customizable agents for Web3 & DeFi applications.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    featureList: [
      'Onchain Persona Analysis',
      'Intent Suggestions',
      'Know Your dApp (KYD)',
      'Customizable AI Agents',
      'Enterprise Knowledge Base',
      'Prompt Templates',
    ],
    screenshot: 'https://getsuite.io/banners/suite-preview-banner.png',
    softwareVersion: '1.0',
    applicationSubCategory: 'DeFi, Web3, Enterprise',
    downloadUrl: 'https://getsuite.io',
  };

  // Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Growly',
    url: 'https://getsuite.io',
    logo: 'https://getsuite.io/logo.png',
    sameAs: ['https://twitter.com/getgrowly', 'https://github.com/getgrowly'],
    description: 'Provider of enterprise AI solutions for Web3 and DeFi applications.',
  };

  // FAQPage schema to address common questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Growly Suite?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Growly Suite is an enterprise AI platform that provides onchain persona analysis, intent suggestions, and customizable agents specifically designed for Web3 and DeFi applications.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Growly Suite help with Web3 user understanding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Growly Suite aggregates multichain transaction data and cross-dApp activities to build comprehensive risk profiles of users, helping DeFi platforms better understand their users despite the anonymity of blockchain.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Know Your dApp (KYD)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KYD is a feature that allows you to feed the AI assistant with everything about your DApp, including GitHub repositories, Gitbooks, and blogs, so it can easily explain your product to users.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
