import createNextIntlPlugin from 'next-intl/plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // Your existing Next.js config here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flowershop-media-server.pelvity.workers.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Completely disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Add the MiniCssExtractPlugin to fix CSS extraction issues
    if (!isServer) {
      config.plugins.push(new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[name].[contenthash].css',
      }));
    }
    
    // Suppress the specific warnings from the Supabase Realtime client
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ }
    ];
    
    return config;
  }
};

export default withNextIntl(nextConfig); 