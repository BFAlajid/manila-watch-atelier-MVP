/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io', 'images.unsplash.com'], // Uploadthing + existing image sources
  },
  experimental: {
    serverActions: true,
  },
  // Ensure proper routing
  trailingSlash: false,
};

module.exports = nextConfig;
