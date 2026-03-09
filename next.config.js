/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    output: 'standalone', // Required for Hostinger Node.js hosting
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            }
        ],
        unoptimized: true, // often needed on Hostinger if sharp is not installed
    },
    async headers() {
        return [
            // ── CORS for External API (Product Uploader Tool) ──────────────────
            // Allows any origin: local HTML files, Google AI Studio apps, external tools
            {
                source: '/api/external/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-api-key, Authorization' },
                    { key: 'Access-Control-Max-Age', value: '86400' },
                ],
            },
            // ── Security Headers for all other routes ──────────────────────────
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Needed if using prisma/sqlite on frontend/browser components
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
            };
        }
        return config;
    },
}

module.exports = nextConfig
