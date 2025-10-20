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
  transpilePackages: ['@getgrowly/core', '@getgrowly/suite', '@getgrowly/ui'],
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
};

export default nextConfig;
