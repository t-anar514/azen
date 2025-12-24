# Azen Deployment Guide

This guide provides step-by-step instructions for deploying the Azen travel platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
    - [Option A: Vercel (Recommended)](#option-a-vercel-recommended)
    - [Option B: Self-Hosting (VPS/Docker)](#option-b-self-hosting-vpsdocker)
4. [Verification](#verification)

---

## Prerequisites

Before deploying, ensure you have:
- A GitHub/GitLab account with the project repository.
- Node.js (v18+) and Yarn installed locally.
- Access to your production environment (Vercel, AWS, DigitalOcean, etc.).

## Environment Variables

The application requires specific environment variables to function correctly. Create a `.env` file in your production environment with the following (check `.env.local` for reference):

```bash
# Example environment variables
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# Add other necessary keys here
```

> [!IMPORTANT]
> Never commit your `.env` files to version control. Use the environment variable settings provided by your hosting platform.

---

## Deployment Options

### Option A: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps with built-in CI/CD.

1. **Connect Repository**: Go to [vercel.com](https://vercel.com) and import your repository.
2. **Configure Project**:
   - Framework Preset: **Next.js**
   - Build Command: `yarn build`
   - Output Directory: `.next`
3. **Environment Variables**: Add your production variables in the "Settings > Environment Variables" tab.
4. **Deploy**: Click "Deploy". Each push to `main` will trigger a new deployment automatically.

### Option B: Self-Hosting (VPS/Docker)

If you prefer to host on your own server (e.g., Ubuntu VPS):

1. **Build the Project**:
   ```bash
   yarn install
   yarn build
   ```
2. **Start the Production Server**:
   We recommend using [PM2](https://pm2.keymetrics.io/) to keep the process running.
   ```bash
   pm2 start npm --name "azen-app" -- start
   ```
3. **Reverse Proxy (Nginx)**:
   Set up Nginx to forward traffic from port 80/443 to the port your Next.js app is running on (default is 3000).

---

## Verification

After deployment, verify the following:
- [ ] The site is accessible via the production URL.
- [ ] Internationalization (`/en`, `/mn`) works correctly.
- [ ] All interactive components (Planner, Maps) are functional.
- [ ] Images from Unsplash are loading (check `next.config.ts` for remote patterns).

> [!TIP]
> Run `yarn lint` and `yarn build` locally before every deployment to catch errors early.
