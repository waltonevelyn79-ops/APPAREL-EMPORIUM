const config = {
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'APPAREL EMPORIUM',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        version: process.env.npm_package_version || '1.0.0',
        env: process.env.NODE_ENV || 'development',
    },
    database: {
        url: process.env.DATABASE_URL || 'file:./dev.db',
    },
    auth: {
        secret: process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL,
    },
    upload: {
        maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        uploadDir: process.env.UPLOAD_DIR || './public/uploads',
    },
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
    },
    features: {
        blog: process.env.FEATURE_BLOG !== 'false',
        rfq: process.env.FEATURE_RFQ !== 'false',
        catalog: process.env.FEATURE_CATALOG !== 'false',
        buyerPortal: process.env.FEATURE_BUYER_PORTAL === 'true',
    },
    github: {
        repo: process.env.GITHUB_REPO_URL || '',
        branch: process.env.GITHUB_BRANCH || 'main',
    },
};

export default config;

