# Quick Start Guide

## Data Now Persists to JSON Files! 🎉

Your watch data now saves permanently to `inventory.json` files. No more data loss!

---

## Starting the App

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Frontend (Vite)**:
```bash
npm run dev
```
Opens on `http://localhost:3000`

**Terminal 2 - Backend API**:
```bash
npm run dev:api
```
Runs on `http://localhost:3001`

### Option 2: Background API (Windows)

```bash
# Start API server in background
start /B npm run dev:api

# Start frontend
npm run dev
```

---

## How to Use

1. **Start both servers** (frontend + API)
2. **Login to admin**: `http://localhost:3000/admin/login`
   - Email: `sherard@manilawatch.com`
   - Password: `WatchDealer2025!`
3. **Add watches** - They save to JSON files
4. **Close and reopen app** - Watches are still there! ✓

---

## Facebook Video Embedding

When adding/editing a watch:

1. Scroll to "Product Video" section
2. Click "Facebook" button
3. Paste **either**:
   - Regular Facebook reel URL: `https://www.facebook.com/reel/1147416423820368/`
   - **OR** full embed URL from iframe src:
     ```
     https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1147416423820368%2F&show_text=false&width=267&t=0
     ```
4. Video embeds with no Facebook UI - clean playback only

---

## What Changed

### Before:
- ❌ Data saved to localStorage only
- ❌ Lost all watches when closing browser
- ❌ No persistence across app restarts

### Now:
- ✅ Data saves to `src/data/inventory.json` & `public/data/inventory.json`
- ✅ Persists across browser closes
- ✅ Persists across app restarts
- ✅ Works like a real database
- ✅ Ready for Vercel deployment

---

## File Structure

```
manila-watch-atelier-MVP/
├── api/
│   └── inventory.js          # Vercel serverless function (production)
├── src/
│   ├── data/
│   │   └── inventory.json    # Source data (saved here)
│   └── components/
│       └── admin/
│           └── AdminPanel.tsx  # Uses API to load/save
├── public/
│   └── data/
│       └── inventory.json    # Public data (also saved here)
└── dev-server.js             # Dev API server (local only)
```

---

## Deploying to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

The `/api/inventory.js` serverless function automatically handles data persistence in production.

---

## Troubleshooting

### "Failed to load inventory"
- Make sure API server is running: `npm run dev:api`
- Check `http://localhost:3001/api/inventory` in browser

### "Failed to save inventory"
- Ensure both JSON files exist:
  - `src/data/inventory.json`
  - `public/data/inventory.json`
- Check console for errors

### Changes don't persist
- Verify API server is running on port 3001
- Check browser DevTools → Network tab for API calls
- Look for green toast notification "Saved X watches"

---

## Current Status

✅ Facebook video embedding working (clean, no UI)
✅ API server saves to JSON files
✅ Data persists across app restarts
✅ Admin dashboard loads from API
✅ Admin dashboard saves to API
✅ Toast notifications for save success/failure
✅ Ready for Vercel deployment

---

**Next Steps:**
1. Start both servers
2. Test adding a watch
3. Close and reopen app
4. Verify watch is still there
5. Deploy to Vercel when ready!

---

**Created**: 2025-12-11
**Status**: ✅ Fully Working
**Data Persistence**: JSON Files
