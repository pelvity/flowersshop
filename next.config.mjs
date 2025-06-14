import createNextIntlPlugin from 'next-intl/plugin';

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
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ }
    ];
    return config;
  }
};

export default withNextIntl(nextConfig); 