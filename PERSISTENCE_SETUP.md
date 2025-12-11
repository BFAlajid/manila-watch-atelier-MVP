# Data Persistence Setup

## Overview

Your Manila Watch Atelier app now saves watch data **permanently to JSON files**. Changes persist across app restarts and deployments.

---

## How It Works

### Local Development
- **Frontend**: React app runs on `http://localhost:3000` (Vite)
- **Backend API**: Node.js server runs on `http://localhost:3001` (dev-server.js)
- **Data Storage**: Saves to `src/data/inventory.json` and `public/data/inventory.json`

### Production (Vercel)
- **Frontend**: Deployed React app
- **Backend API**: Vercel Serverless Functions (`/api` folder)
- **Data Storage**: Saves to JSON files in the deployment

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install express cors
```

### 2. Add Scripts to package.json

Add these to your `"scripts"` section in package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:api": "node dev-server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:api\"",
    "build": "vite build"
  }
}
```

Optionally install `concurrently` to run both servers at once:

```bash
npm install --save-dev concurrently
```

### 3. Start Development

**Option A: Run both servers with one command** (if you installed concurrently):
```bash
npm run dev:all
```

**Option B: Run in separate terminals**:

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend API:
```bash
npm run dev:api
```

---

## Usage

### Adding/Editing/Deleting Watches

1. Login to admin dashboard: `http://localhost:3000/admin/login`
2. Add, edit, or delete watches
3. Changes are saved immediately to both:
   - `src/data/inventory.json`
   - `public/data/inventory.json`
4. **Close and reopen the app** - your watches are still there! ✓

---

## File Structure

```
manila-watch-atelier-MVP/
├── api/
│   └── inventory.js          # Vercel serverless function (production)
├── src/
│   └── data/
│       └── inventory.json    # Source inventory data
├── public/
│   └── data/
│       └── inventory.json    # Public inventory data (served to frontend)
├── dev-server.js             # Development API server (local only)
└── vite.config.ts            # Vite configuration
```

---

## How Admin Changes Are Saved

### Development Flow:
1. Admin adds/edits/deletes a watch in dashboard
2. Frontend sends POST request to `http://localhost:3001/api/inventory`
3. dev-server.js receives the request
4. Saves watch data to BOTH JSON files
5. Toast notification confirms "Saved X watches"
6. **Data persists permanently** ✓

### Production Flow (Vercel):
1. Admin adds/edits/deletes a watch
2. Frontend sends POST request to `/api/inventory`
3. Vercel serverless function handles the request
4. Saves to JSON files in deployment
5. Changes persist across deployments

---

## Vercel Deployment

### vercel.json Configuration

Create `vercel.json` in root:

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## API Endpoints

### GET `/api/inventory`
**Description**: Fetch all watches
**Response**: Array of watch objects

```json
[
  {
    "id": "watch-001",
    "brand": "Rolex",
    "model": "Submariner",
    ...
  }
]
```

### POST `/api/inventory`
**Description**: Save entire inventory
**Body**: Array of watch objects
**Response**:

```json
{
  "success": true,
  "message": "Saved 5 watches",
  "count": 5
}
```

---

## Troubleshooting

### "Failed to load inventory" Error

**Problem**: Frontend can't connect to backend API

**Solution**:
1. Check if dev-server.js is running on port 3001
2. Open `http://localhost:3001/api/inventory` in browser
3. Should see JSON array (even if empty)

### "Failed to save inventory" Error

**Problem**: Backend can't write to JSON files

**Solution**:
1. Check file permissions
2. Ensure `src/data/inventory.json` exists
3. Ensure `public/data/inventory.json` exists
4. Check dev-server.js console for error details

### Changes Not Persisting

**Problem**: Watches disappear after restarting app

**Solution**:
1. Ensure dev-server.js is running
2. Check browser console for API errors
3. Verify JSON files are being written (check file modified time)

---

## Benefits of This Setup

✅ **Persistent Data** - Watches saved to JSON files survive app restarts
✅ **Works Locally** - Full CRUD operations in development
✅ **Works on Vercel** - Serverless functions handle API in production
✅ **No Database Needed** - Simple JSON file storage
✅ **Easy Backup** - Just copy the JSON files
✅ **Version Control** - Can commit inventory to Git if desired

---

## Limitations

⚠️ **Single User** - No concurrent editing safeguards
⚠️ **No Conflict Resolution** - Last write wins
⚠️ **File Size** - JSON can get large with many watches/images
⚠️ **No Transactions** - If write fails mid-save, data may be inconsistent

---

## Future: Database Migration

When ready to scale, you can migrate to a real database:

1. **Vercel Postgres** (recommended)
2. **Supabase**
3. **MongoDB Atlas**
4. **PlanetScale**

The API structure is already in place - just swap the file I/O for database queries.

---

## Current Status

✅ Admin Panel fetches data from API
✅ Admin Panel saves data to API
✅ API writes to JSON files
✅ Data persists across restarts
✅ Works in development
✅ Ready for Vercel deployment

---

**Created**: 2025-12-11
**Status**: Ready to Use
**Data Storage**: JSON Files (Persistent)
