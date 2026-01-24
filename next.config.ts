/** @type {import('next').NextConfig} */
const nextConfig = {

    transpilePackages: [
        '@react-pdf/renderer',
        '@react-pdf/types'
    ],
    images: {
        formats: ['image/webp', 'image/avif'],
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/uploads/**',
            },
        ],
    },
}
module.exports = nextConfig