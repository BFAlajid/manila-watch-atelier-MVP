# 🚀 Deployment Guide - Manila Watch Atelier

## Quick Demo Deployment (Current Version)

This guide will help you deploy the **frontend-only demo** to Vercel for free.

**What you'll get:**
- ✅ Live website at `https://manila-watch-atelier.vercel.app`
- ✅ All features working (currency, inventory, admin dashboard)
- ✅ Auto-deploy on every git push
- ✅ Free SSL certificate (HTTPS)
- ✅ Global CDN (fast worldwide)
- ⚠️ **No payment processing yet** (we'll add that incrementally)

---

## Prerequisites

1. **GitHub Account** - Create at https://github.com if you don't have one
2. **Vercel Account** - Sign up at https://vercel.com (use GitHub login)
3. **Git Installed** - Should already be on your computer

---

## Step 1: Push Code to GitHub (5 minutes)

### Option A: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and login** with your GitHub account
3. **Add this project**:
   - File → Add Local Repository
   - Choose: `c:\Users\ROG\Documents\SideWork\Sherard Websitge`
   - Click "Create Repository"

4. **Make initial commit**:
   - Summary: "Initial commit - Manila Watch Atelier"
   - Click "Commit to main"

5. **Publish to GitHub**:
   - Click "Publish repository"
   - Name: `manila-watch-atelier`
   - ✅ Keep code private (unchecked = public)
   - Click "Publish Repository"

### Option B: Using Command Line

```bash
cd "c:\Users\ROG\Documents\SideWork\Sherard Websitge"

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Manila Watch Atelier"

# Create repository on GitHub (you'll need to do this via website first)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/manila-watch-atelier.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (3 minutes)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Import" next to your `manila-watch-atelier` repo
   - Or: Click "Add New..." → Project → Import Git Repository

3. **Configure Project**:
   ```
   Project Name: manila-watch-atelier
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Environment Variables** (Leave empty for now):
   - We'll add these later when implementing backend

5. **Click "Deploy"**

6. **Wait 2-3 minutes** ⏳

7. **Done!** 🎉
   - Your site is live at: `https://manila-watch-atelier.vercel.app`
   - You'll get a custom URL like: `manila-watch-atelier-abc123.vercel.app`

---

## Step 3: Test Your Deployment

Visit your new URL and test:

- ✅ Homepage loads
- ✅ Can browse inventory
- ✅ Can view watch details
- ✅ Currency conversion works
- ✅ Admin login works (sherard@manilawatch.com / WatchDealer2025!)
- ✅ Mobile responsive
- ✅ Dark/light theme toggle

---

## Step 4: Share with Sherard

Send Sherard the live URL:
```
🎉 Manila Watch Atelier is live!

Demo: https://your-project.vercel.app

Login:
- URL: https://your-project.vercel.app/#/admin/login
- Email: sherard@manilawatch.com
- Password: WatchDealer2025!

This is a demo version. Payment processing will be added next.
```

---

## Adding Custom Domain (Optional - Later)

Once you buy a domain (e.g., manilawatchatelier.com):

1. Go to your project in Vercel dashboard
2. Settings → Domains
3. Add domain: `manilawatchatelier.com`
4. Follow DNS instructions (update nameservers)
5. Wait 5-60 minutes for propagation
6. Done! Your site is at your custom domain

**Cost**: $10-50/year (domain only, hosting is free)

---

## Auto-Deploy on Updates

**Good news**: Every time you push to GitHub, Vercel automatically rebuilds and deploys!

### Workflow:
1. Make code changes locally
2. Commit in GitHub Desktop (or `git commit`)
3. Push to GitHub (or `git push`)
4. Vercel auto-deploys in 2-3 minutes
5. Changes are live!

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Fix**: Make sure all imports are correct, check file paths

**Error**: `Command failed`
- **Fix**: Run `npm run build` locally first to test

### Site Loads But Broken

**Issue**: Images not loading
- **Fix**: Check image paths in `public/` folder

**Issue**: Routing doesn't work
- **Fix**: Already handled by `vercel.json` (HashRouter)

### Need Help?

1. Check Vercel build logs (click "View Function Logs")
2. Check browser console for errors (F12)
3. Contact me with error screenshot

---

## What's Next: Backend Implementation

After Sherard reviews the demo, we'll add features incrementally:

### Week 1: Payment Infrastructure
- [ ] Set up database (Vercel Postgres)
- [ ] Create Stripe account
- [ ] Implement card payment API
- [ ] Test checkout flow

### Week 2: Bank Transfer & Admin
- [ ] Add file upload for payment proofs
- [ ] Build admin payment verification
- [ ] Implement email notifications
- [ ] Test complete order flow

### Week 3: Polish & Launch
- [ ] Add order tracking
- [ ] Improve admin dashboard
- [ ] Security audit
- [ ] Production launch

Each feature will be:
1. Developed locally
2. Tested thoroughly
3. Deployed to staging
4. Tested live
5. Pushed to production

---

## Current Features (Live Now)

### ✅ Working Features:
- Beautiful responsive design
- 36 luxury watch listings
- Multi-currency (20 currencies)
- Currency auto-detection
- Search and filter
- Dark/light theme
- Admin dashboard (view-only)
- Psychological UX features
- Mobile optimized

### ⏳ Coming Soon (Backend):
- Stripe card payments
- Bank transfer verification
- Order management
- Email notifications
- Shipping/pickup selection
- Inventory tracking
- Customer accounts

---

## Deployment Checklist

Before deploying:
- [x] Production build works locally
- [x] No console errors
- [x] All images load
- [x] Currency conversion works
- [x] Admin login works
- [x] Mobile responsive
- [x] Created `vercel.json` config
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Tested live site
- [ ] Shared with Sherard

---

## Support

**For deployment issues**: Check Vercel docs or contact me
**For code changes**: We'll implement features step by step
**For Sherard training**: Use TRAINING_GUIDE.md

---

**Ready to deploy?** Follow Steps 1-3 above!

**Need help?** Let me know which step you're stuck on.

---

**Deployment Status**: ⏳ Ready to deploy (waiting for GitHub push)
**Last Updated**: December 10, 2025
