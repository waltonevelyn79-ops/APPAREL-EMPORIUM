#!/bin/bash
# Manual deployment to Hostinger
# Usage: ./deploy.sh

echo "🚀 Starting deployment to Hostinger..."

HOST="your_hostinger_domain_or_ip"
USER="your_ssh_username"
APP_DIR="/home/$USER/your-app-directory"

echo "Connecting to $HOST via SSH to update application..."

ssh $USER@$HOST << EOF
  echo "=> Entering app directory..."
  cd $APP_DIR || exit 1
  
  echo "=> Pulling latest changes from Git..."
  git pull origin main
  
  echo "=> Ensuring production .env exists..."
  if [ -f .env.production ]; then
    cp .env.production .env
  else
    echo "DATABASE_URL=\"file:./dev.db\"" > .env
  fi
  
  echo "=> Installing dependencies..."
  npm ci --production
  
  echo "=> Generating Prisma Client..."
  npx prisma generate
  
  echo "=> Pushing Database Schema..."
  npx prisma db push
  
  echo "=> Building Next.js app..."
  npm run build
  
  echo "=> Restarting PM2 process..."
  pm2 restart garments-website || pm2 start ecosystem.config.js
  
  echo "=> ✅ Deployment complete!"
EOF

echo "🎉 Done! Application has been successfully deployed."
