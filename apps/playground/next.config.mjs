import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

export default phase => {
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD;
  const isVercelProd = process.env.VERCEL_ENV === 'production';
  const assetPrefix = isProdBuild && isVercelProd ? 'https://playground.getgrowly.xyz' : '';
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    assetPrefix,
    typescript: {
      ignoreBuildErrors: true,
    },
    // Transpile workspace packages for Turbopack and Webpack
    transpilePackages: ['@getgrowly/suite'],
    // Turbopack configuration
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: config => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      return config;
    },
  };
  return nextConfig;
};
