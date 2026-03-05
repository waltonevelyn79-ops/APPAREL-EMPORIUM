# Deployment Checklist

## Before Upload
- [ ] All code errors fixed (`npm run build` succeeds)
- [ ] `.env.production` file created with real production values
- [ ] `NEXTAUTH_SECRET` is a strong random string (e.g., generated with `openssl rand -base64 32`)
- [ ] Database seed data is correct (company name, email, etc. in `prisma/seed.ts`)
- [ ] Default admin passwords changed from defaults in `prisma/seed.ts`
- [ ] Logo files correctly placed in `/public/uploads/logos/`
- [ ] Hero slider images placed in `/public/images/`
- [ ] `robots.txt` is appropriately structured for production
- [ ] `sitemap.ts` generates correct URLs with the production domain

## Hostinger Setup
- [ ] Node.js VPS / hosting plan is active
- [ ] Node.js version set to 18 or 20 (Hostinger supports latest LTS)
- [ ] Domain is connected and DNS records (A/CNAME) configured
- [ ] SSL certificate installed (free Let's Encrypt SSL from Hostinger hPanel)
- [ ] PM2 process manager is ready/installed if using VPS (`npm install -g pm2`)

## Upload & Install
- [ ] Files uploaded via SFTP, Git, or extracted via File Manager (`deploy.tar.gz`)
- [ ] `npm ci` or `npm install` completed on target server
- [ ] `npx prisma generate` completed to build Prisma client
- [ ] `npx prisma db push` completed to sync database schema
- [ ] `npx prisma db seed` completed (first time only, to create admins and base data)
- [ ] `npm run build` completed (if not using the pre-built `.next` folder from `deploy.tar.gz`)
- [ ] Application started with `pm2 start ecosystem.config.js` or `npm start`

## Post-Deployment
- [ ] Website loads successfully at `https://yourdomain.com`
- [ ] Admin login works perfectly at `https://yourdomain.com/admin/login`
- [ ] All pages (Home, About, Products, Contact) load without 404 or 500 errors
- [ ] Images display correctly across the entire site
- [ ] Contact form / RFQ (Request for Quote) submits successfully
- [ ] Mobile responsive layout works smoothly on real devices
- [ ] Dark / Light mode toggles work
- [ ] Product listing, categories, and detail pages work correctly
- [ ] Admin dashboard charts and stats load correctly
- [ ] Image, PDF, and file upload in the admin dashboard works precisely
- [ ] SMTP email sending works (you can test this via the admin system)
- [ ] Tracking pixels (GA, Facebook Pixel) fire correctly (verified with browser DevTools)

## Security
- [ ] Change Developer super-admin password from the default one
- [ ] Change Admin password from the default one
- [ ] Remove or change the testing 'Editor' account
- [ ] Set an extremely strong `NEXTAUTH_SECRET` in Hostinger environment variables or `.env`
- [ ] Verify maintenance mode toggle restricts public access when enabled (if applicable)
