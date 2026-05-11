import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@change/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
