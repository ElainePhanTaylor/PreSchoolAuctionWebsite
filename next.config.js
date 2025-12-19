/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // Allow all HTTPS images (admin-only uploads)
      },
    ],
  },
}

module.exports = nextConfig


