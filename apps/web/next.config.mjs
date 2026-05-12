/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@change/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
