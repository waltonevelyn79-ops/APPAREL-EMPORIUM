# Changelog

## [1.0.0] - 2024-11-20
### Initial Release
- Multi-page garments buying house website
- Admin dashboard with 5-tier RBAC (Developer, Super Admin, Admin, Editor, Viewer)
- Dynamic CMS with homepage builder
- Product management with bulk upload via Excel
- RFQ system with Kanban board
- Blog system
- Media library
- Theme manager
- Menu builder
- SEO manager
- Tracking pixel manager
- Email notification system
- Cookie consent
- Activity logging
- Backup & restore capabilities

## How to Update
1. Push changes to GitHub main branch
2. GitHub Actions auto-deploys via SSH, OR
3. Use Admin Dashboard → Maintenance → Check for Updates → Update Now
4. Manual Method: SSH into server, `git pull`, `npm run build`, `pm2 restart garments-website`
