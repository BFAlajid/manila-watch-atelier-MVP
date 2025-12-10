# 🚀 Vercel Deployment - Step by Step

## Prerequisites

✅ Git repository created (DONE!)
⏳ GitHub repository created (DO THIS FIRST - see GITHUB_SETUP.md)
⏳ Code pushed to GitHub

---

## Step 1: Create Vercel Account (1 minute)

1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Done! You're logged in

---

## Step 2: Import Project from GitHub (2 minutes)

1. **Go to Vercel Dashboard**: https://vercel.com/new

2. **You'll see**: "Import Git Repository"

3. **Find your repository**:
   - Look for: `manila-watch-atelier`
   - Click **"Import"** button next to it

4. **If you don't see it**:
   - Click "Adjust GitHub App Permissions"
   - Select your repository
   - Click "Install"

---

## Step 3: Configure Project (1 minute)

You'll see a configuration screen:

### Project Settings:
```
Project Name: manila-watch-atelier
(You can change this if you want)

Framework Preset: Other
(Vercel auto-detects Vite)

Root Directory: ./
(Leave as is)

Build Command: npm run build
(Should be auto-filled)

Output Directory: build
(Should be auto-filled)

Install Command: npm install
(Should be auto-filled)
```

### Environment Variables:
**LEAVE EMPTY FOR NOW**

We'll add these later when implementing backend:
- DATABASE_URL
- STRIPE_SECRET_KEY
- etc.

---

## Step 4: Deploy! (2-3 minutes)

1. Click the big **"Deploy"** button

2. **Watch the deployment**:
   ```
   ⏳ Cloning repository...
   ⏳ Installing dependencies...
   ⏳ Running build...
   ⏳ Uploading files...
   ✅ Deployment ready!
   ```

3. **Wait for it to finish** (usually 2-3 minutes)

---

## Step 5: View Your Live Site! 🎉

Once deployment completes:

1. You'll see: **"Congratulations!"** with confetti

2. Your live URL will be something like:
   ```
   https://manila-watch-atelier-abc123.vercel.app
   ```

3. **Click "Visit"** or copy the URL

4. **Test your site**:
   - ✅ Homepage loads
   - ✅ Browse inventory
   - ✅ View watch details
   - ✅ Currency conversion works
   - ✅ Admin login works

---

## Step 6: Share with Sherard

Send him this message:

```
🎉 Manila Watch Atelier Demo is Live!

Website: https://manila-watch-atelier-abc123.vercel.app

Admin Access:
URL: https://manila-watch-atelier-abc123.vercel.app/#/admin/login
Email: sherard@manilawatch.com
Password: WatchDealer2025!

Please test:
- Browse watches
- Test currency conversion (20 currencies)
- Try admin dashboard
- Check on mobile

This is the demo version. Payment processing will be added next based on your feedback.
```

---

## Optional: Custom Domain (Later)

Once you buy manilawatchatelier.com:

1. Go to Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `manilawatchatelier.com`
4. Follow DNS instructions
5. Wait for propagation (5-60 minutes)
6. Done! Site is at your custom domain

---

## Troubleshooting

### Build Fails

**Error**: "Command failed: npm run build"

**Solution**:
1. Check build logs for specific error
2. Most common: Missing dependencies
3. Fix: Ensure package.json is correct

### Site Loads But Broken

**Issue**: Blank page or errors

**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Usually: Incorrect file paths

### Can't Find Repository

**Issue**: Repository not showing in Vercel

**Solution**:
1. Click "Adjust GitHub App Permissions"
2. Grant access to repository
3. Refresh Vercel page

---

## Auto-Deploy Feature

**Good news**: Every time you push to GitHub, Vercel automatically rebuilds and deploys!

### Workflow:
1. Make code changes locally
2. `git add .`
3. `git commit -m "Update feature"`
4. `git push`
5. Vercel auto-deploys in 2-3 minutes ✨

---

## Vercel Dashboard Features

After deployment, explore:

### Deployments Tab
- See all deployments
- View build logs
- Rollback to previous version

### Settings Tab
- Environment variables
- Custom domains
- Build settings

### Analytics Tab
- Visitor stats (free tier: limited)
- Page views
- Top pages

---

## What's Deployed

**Current features (live now)**:
- ✅ 36 luxury watches
- ✅ Multi-currency (20 currencies)
- ✅ Search and filter
- ✅ Admin dashboard (view-only)
- ✅ Dark/light theme
- ✅ Psychological UX features
- ✅ Mobile responsive

**Not yet (backend needed)**:
- ⏳ Payment processing
- ⏳ Order management
- ⏳ Email notifications

---

## Next Steps

1. **Get Sherard's feedback** on the demo
2. **Make any UI tweaks** he requests
3. **Start backend implementation** (when ready)
   - See: INCREMENTAL_ROADMAP.md

---

## Support

**Deployment issues?**
- Check Vercel build logs
- Contact me with screenshot

**Want to add features?**
- See INCREMENTAL_ROADMAP.md
- We'll implement step-by-step

---

**Deployment Status**: ⏳ Waiting for you to complete Steps 1-5

**Estimated Time**: 5-7 minutes total

**Cost**: $0 (completely free!)

---

**Questions?** Let me know which step you're on and I'll help!
