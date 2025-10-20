/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Transpile workspace packages for Turbopack and Webpack
  transpilePackages: [
    '@getgrowly/chainsmith',
    '@getgrowly/core',
    '@getgrowly/persona',
    '@getgrowly/suite',
    '@getgrowly/ui',
  ],
  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Bundle pages router dependencies
  bundlePagesRouterDependencies: true,
  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    if (dev) {
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    return config;
  },
};

export default nextConfig;
