import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function SEOHead({
  title = 'Suite | AI-Powered Web3 Growth Platform | GetSuite.io',
  description = 'Suite is the leading AI-powered platform for Web3 growth. Understand user personas, get actionable insights, and scale your DeFi or NFT project with enterprise-grade analytics and AI agents.',
  keywords = 'Web3 AI platform, DeFi analytics, NFT user insights, blockchain analytics, crypto user personas, onchain data analysis, Web3 growth platform, AI agents for crypto',
  image = '/banners/suite-banner-oil.png',
  url = 'https://getsuite.io',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Growly Team',
}: SEOHeadProps) {
  const fullImageUrl = image.startsWith('http') ? image : `https://getsuite.io${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Suite - AI-Powered Web3 Growth Platform" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@getgrowly" />
      <meta name="twitter:site" content="@getgrowly" />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#2465ED" />
      <meta name="msapplication-TileColor" content="#2465ED" />

      {/* Article specific meta tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="US" />

      {/* Mobile App Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Suite" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* Structured Data for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description,
            url: url,
            mainEntity: {
              '@type': 'SoftwareApplication',
              name: 'Suite',
              description: 'AI-Powered Web3 Growth Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            },
          }),
        }}
      />
    </Head>
  );
}
