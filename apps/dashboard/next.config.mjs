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
  // Development optimizations
  experimental: {
    // Enable faster refresh
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Optimize bundle analysis
    bundlePagesExternals: true,
  },
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

      // Disable source maps in development for faster builds
      config.devtool = 'eval-cheap-module-source-map';
    }

    return config;
  },
};

export default nextConfig;
