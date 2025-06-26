/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/google/fonts/main/**',
      },
    ],
  },
  experimental: {
    // This will provide more detailed logs in the Vercel deployment console.
    logging: 'verbose',
  },
};

export default nextConfig; 