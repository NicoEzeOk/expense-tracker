/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/expense-tracker',
  assetPrefix: '/expense-tracker',
}

module.exports = nextConfig 