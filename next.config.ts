import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  webpack: (config, { isServer }) => {
    // Suppress the specific warnings from the Supabase Realtime client
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ }
    ];
    return config;
  }
};

export default nextConfig;
