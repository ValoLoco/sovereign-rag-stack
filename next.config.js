/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable ESLint during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during build (use CI for checks)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Experimental features
  experimental: {
    typedRoutes: false, // Disable typed routes for now
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
