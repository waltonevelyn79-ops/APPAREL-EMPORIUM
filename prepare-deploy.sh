#!/bin/bash
# Deployment Preparation Script for Hostinger
echo "🚀 Preparing deployment for Hostinger..."

# Step 1: Check Node.js version
echo "Checking Node.js version..."
node -v || { echo "❌ Node.js not found!"; exit 1; }

# Step 2: Linting
echo "Running linter..."
npm run lint || { echo "❌ Linting failed! Please fix ESLint errors."; exit 1; }

# Step 3: TypeScript validation
echo "Running TypeScript compiler check..."
npx tsc --noEmit || { echo "❌ TypeScript errors found! Please fix before deployment."; exit 1; }

# Step 4: Environment check
echo "Checking for .env.production..."
if [ ! -f .env.production ]; then
    echo "⚠️ .env.production not found. Make sure you create it based on .env.example before uploading to server!"
else
    echo "✅ .env.production exists."
fi

# Step 5: Build
echo "Building project for production..."
npm run build || { echo "❌ Build failed!"; exit 1; }

# Step 6: Verify build
if [ ! -d ".next" ]; then
    echo "❌ Build directory (.next) not created!"
    exit 1
fi
echo "✅ Build successful!"

# Step 7: Packaging for Hostinger File Manager
echo "Packaging for deployment..."
rm -f deploy.tar.gz

# Note: We don't pack node_modules to keep size small. npm install should be run on the server.
tar -czf deploy.tar.gz .next public package.json package-lock.json prisma next.config.js ecosystem.config.js .env.production .env.example .htaccess

if [ -f "deploy.tar.gz" ]; then
    # Cross-platform file size check fallback
    FILESIZE=$(stat -c%s "deploy.tar.gz" 2>/dev/null || stat -f%z "deploy.tar.gz" 2>/dev/null || wc -c < "deploy.tar.gz" | tr -d ' ' || echo "Unknown size")
    echo "✅ Created deploy.tar.gz ($FILESIZE bytes)."
    echo ""
    echo "================================================================="
    echo "🚀 DEPLOYMENT READY!"
    echo "================================================================="
    echo "1. Upload 'deploy.tar.gz' to Hostinger's File Manager for your app directory."
    echo "2. Extract the file there."
    echo "3. Open Hostinger SSH Terminal in that directory and run:"
    echo "   $ npm ci"
    echo "   $ npx prisma generate"
    echo "   $ npx prisma db push  (only if you're not using migrations)"
    echo "4. Start the application using PM2:"
    echo "   $ pm2 start ecosystem.config.js"
    echo "================================================================="
else
    echo "❌ Failed to create deploy package."
    exit 1
fi
