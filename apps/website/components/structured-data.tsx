import Script from 'next/script';

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Suite',
    url: 'https://getsuite.io',
    logo: 'https://getsuite.io/logos/suite-logo.png',
    description: 'AI-Powered Web3 Growth Platform for DeFi and NFT analytics',
    sameAs: [
      'https://twitter.com/getgrowly',
      'https://linkedin.com/company/getgrowly',
      'https://github.com/growly-foundation',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'team@getsuite.io',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Suite',
    description:
      'AI-Powered Web3 Growth Platform for understanding user personas and scaling DeFi/NFT projects',
    url: 'https://getsuite.io',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    featureList: [
      'AI-powered user persona analysis',
      'DeFi analytics and insights',
      'NFT project analytics',
      'Blockchain user behavior tracking',
      'Web3 growth optimization',
      'Onchain data analysis',
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Suite - AI-Powered Web3 Growth Platform',
    url: 'https://getsuite.io',
    description: 'Leading AI platform for Web3 growth, DeFi analytics, and NFT user insights',
    publisher: {
      '@type': 'Organization',
      name: 'Growly',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://getsuite.io/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://getsuite.io',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Features',
        item: 'https://getsuite.io/features',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Pricing',
        item: 'https://getsuite.io/pricing',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Suite?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Suite is an AI-powered Web3 growth platform that helps DeFi and NFT projects understand their users, get actionable insights, and scale effectively through advanced analytics and AI agents.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Suite help with Web3 growth?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Suite provides onchain persona analysis, user behavior tracking, and AI-powered insights to help Web3 projects understand their users and optimize their growth strategies.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of analytics does Suite provide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Suite offers DeFi analytics, NFT project analytics, blockchain user behavior tracking, onchain data analysis, and AI-powered user persona insights.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Suite free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Suite offers a free tier to get started. You can sign up at https://app.getsuite.io to begin using our AI-powered Web3 growth platform.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
