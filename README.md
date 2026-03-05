slm# GlobalStitch Sourcing — Garments Buying House Website

A complete, production-ready, full-stack garments buying house website built with the modern Next.js 14 App Router, robust server actions, an administrative dashboard, custom drag-and-drop form builders, and a dynamic theming system.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS (Dynamic variable root system)
- **Database**: Prisma ORM with SQLite (Easily swap to PostgreSQL/MySQL via simply changing the provider in schema)
- **Authentication**: NextAuth.js (Credentials Provider with Bcrypt Hashing)
- **Icons**: Lucide React

## Prerequisites
- Node.js 18+
- npm or yarn

## Local Development Setup

1. **Clone repository & enter directory**
   ```bash
   git clone <repo-url>
   cd garments-buying-house
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your `NEXTAUTH_SECRET` and other properties.*

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Initialize Database & Prisma Client**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the Database**
   This automatically creates default Admins, Site Settings, dummy Products, and default Layout references based on our seed files.
   ```bash
   npx prisma db seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Main Site: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Default Login Credentials
Upon successful database seed, the following users are created automatically.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Developer** | `dev@globalstitch.com` | `DevMaster@2024` |
| **Super Admin** | `admin@globalstitch.com` | `Admin@2024` |
| **Editor** | `editor@globalstitch.com` | `Editor@2024` |

*Security Note: It is highly recommended to change these default passwords or remove dummy accounts before taking the application live.*

---

## Hostinger Deployment Steps

Deploying to Hostinger via their **Node.js Environment** or **VPS**:

1. **Build locally or on server:**
   ```bash
   npm run build
   ```
2. **Create a Node.js App** inside the Hostinger panel.
3. **Upload Files**: Upload the generated `.next`, `public`, `prisma` folders alongside `package.json` either via GIT webhooks or FTP/File Manager. 
4. **Environment Variables**: Head to the environment variables section in the Hostinger panel and load all variables exactly as they appear in your `.env`.
5. **Node Version**: Ensure Node.js Version in settings is configured to `18` or `20+`.
6. **Install Production Dependencies**:
   ```bash
   npm install --production
   ```
7. **Database Sync via Terminal**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
8. **Start Application**: Set the start command to `npm start` natively via the panel or configure a process manager like **PM2**.
9. **Domain & SSL**: Link your domain and enforce HTTPS/SSL within the hPanel.

---

## After Deployment Initialization Checklist

Log in as the `Developer` or `SUPER_ADMIN` and navigate through the dashboard to prepare for production:

1. **Settings**: Go to `Settings -> General` and update your official Company Info, Addresses, and Google Maps embed keys.
2. **Theme Manager**: Go to `Theme Defaults`. Upload your light/dark Mode logos and set your primary `(--color-primary)` variables.
3. **Tracking & Analytics**: Go to `Tracking` and input your Facebook Pixel IDs or Google Tag Manager configuration for immediate live metric capture.
4. **Navigation**: Adjust top-level hierarchies via the `Menu Builder`.
5. **Commerce**: Traverse to `Products` and `Categories` to bulk delete dummy seed items and start adding real inventory.
6. **Mailer Setup**: Go to `Email Settings` to configure your Hostinger/SMTP relay to ensure form submissions send properly out over ports 465/587.

---

## Troubleshooting

- **"Prisma Client / Error loading database":** Run `npx prisma generate` to rebuild the types or ensure your `DATABASE_URL` accurately matches the sqlite relative `.db` path in your `.env`.
- **"Image Uploads Failing (500)":** Ensure that `public/uploads` has proper read/write `chmod 755/777` permissions across your operating system context in Hostinger.
- **"Build Process Bailout / EPERM":** Stop NextJS background processes running, delete `.next`, and rerun `npm run build`.
- **Database Reset:** If you wish to purge all sqlite data quickly and start entirely fresh:
  ```bash
  npx prisma db push --force-reset
  npx prisma db seed
  ```

# APPAREL-EMPORIUM

