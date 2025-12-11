# Image Upload Guide - Manila Watch Atelier

## ✅ Image Upload is NOW Working!

You can now upload images directly from the admin dashboard and they'll be saved to your local `public/images/watches/` folder!

---

## How to Upload Images

### Step 1: Open Admin Dashboard

1. **Start the API server**:
   ```bash
   npm run dev:api
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Login** to admin: `http://localhost:3000/admin/login`

### Step 2: Add or Edit a Watch

1. Click **"Add New Watch"** or **Edit** an existing watch
2. Scroll to **"Image Gallery"** section
3. Click to expand if collapsed

### Step 3: Upload Images

You have **2 options**:

#### Option A: Upload Files (RECOMMENDED)

1. Click **"Upload Files"** button
2. Either:
   - **Drag & drop** your images onto the upload area
   - OR **Click "Choose Files"** and select from your computer
3. Select one or multiple images (JPG, PNG, WebP)
4. Images upload automatically!
5. You'll see a green toast notification: "Uploaded X image(s)"
6. Images appear in the gallery

#### Option B: Add via URL

1. Click **"Add via URL"** button
2. Paste image URL (e.g., from Imgur or other hosting)
3. Press Enter or click the + button
4. Image added instantly

---

## What Happens When You Upload

### Upload Process:

1. **You select images** → Files are uploaded to API server
2. **API saves to** → `public/images/watches/` folder
3. **Files are renamed** → `1702345678-yourimage.jpg` (timestamp + filename)
4. **URLs returned** → `/images/watches/1702345678-yourimage.jpg`
5. **Watch saved** → Images persist permanently! ✓

### File Naming:

**Original**: `rolex-submariner.jpg`
**Saved as**: `1702345678-rolex-submariner.jpg`

The timestamp prevents filename conflicts.

---

## Features

### ✅ What Works:

- **Drag & drop** multiple images
- **Click to browse** and select files
- **Automatic upload** to local folder
- **Progress feedback** with toast notifications
- **Multiple images** at once (up to 10)
- **Image preview** before saving watch
- **Reorder images** via drag & drop
- **Set primary image** (star icon)
- **Delete images** (trash icon)
- **Permanent storage** in `public/images/watches/`

### Image Specifications:

- **Formats**: JPG, PNG, WebP
- **Max Size**: 10MB per image
- **Recommended**: 1200x1200px (square)
- **Multiple**: Upload up to 10 images at once

---

## Example Workflow

### Adding a New Watch with Images:

1. **Take photos** of your watch:
   - Front dial shot
   - Wrist shot
   - Case back
   - Bracelet detail
   - Box & papers

2. **Login** to admin dashboard

3. **Click "Add New Watch"**

4. **Fill in watch details**:
   - Brand: Rolex
   - Model: Submariner
   - Reference: 116610LN
   - Price, etc.

5. **Scroll to "Image Gallery"**

6. **Click "Upload Files"**

7. **Drag all 5 photos** onto the upload area

8. **Wait 2-3 seconds** → "Uploaded 5 image(s)" notification

9. **Reorder if needed** (drag thumbnails)

10. **Set primary image** (click star icon on best photo)

11. **Click "Save Watch"**

12. **Done!** Watch appears with images ✓

---

## Image Display

### Where Your Images Appear:

1. **Admin Dashboard** - Thumbnail in table
2. **Inventory Page** - Main image on product card
3. **Watch Detail Page** - Full gallery with carousel
4. **Recently Viewed** - Thumbnails

### Image Loading:

- **First image** = Primary image (shows everywhere)
- **Additional images** = Gallery on detail page
- **Missing image?** = Black background (no ugly fallback)

---

## Troubleshooting

### "Failed to upload images"

**Causes**:
- API server not running
- File too large (>10MB)
- Not an image file
- Network error

**Fix**:
1. Check API server is running: `npm run dev:api`
2. Verify file size (max 10MB per image)
3. Check file format (JPG, PNG, WebP only)
4. Check browser console for errors

### Images don't show after upload

**Causes**:
- Watch not saved yet
- Page needs refresh
- Image path incorrect

**Fix**:
1. Make sure you clicked "Save Watch"
2. Hard refresh: Ctrl + Shift + R
3. Check `public/images/watches/` folder for files
4. Verify images array in watch data

### Upload works but images disappear

**Causes**:
- API server restarted
- Files deleted from folder

**Fix**:
- Files are in `public/images/watches/` - they persist!
- Check folder to verify files are there
- If missing, re-upload images

---

## Image File Organization

### Folder Structure:

```
manila-watch-atelier-MVP/
└── public/
    └── images/
        └── watches/
            ├── 1702345678-rolex-submariner-front.jpg
            ├── 1702345679-rolex-submariner-wrist.jpg
            ├── 1702345680-rolex-submariner-caseback.jpg
            └── ...
```

### Benefits:

- ✅ **Permanent storage** - Files don't disappear
- ✅ **Easy backup** - Just copy the `watches/` folder
- ✅ **No external dependencies** - Works offline
- ✅ **Fast loading** - Images served directly from your site
- ✅ **Version control ready** - Can commit images to Git if desired

---

## Advanced: Image Optimization

### Before Uploading (Recommended):

1. **Resize images** to 1200x1200px
   - Use: Photoshop, GIMP, or online tools
   - Smaller files = faster loading

2. **Compress images**
   - Use: TinyPNG.com or ImageOptim
   - Reduce file size without losing quality

3. **Convert to WebP** (optional)
   - Modern format, smaller file size
   - Use: Squoosh.app or CloudConvert

### Why Optimize?

- ✅ **Faster page loading**
- ✅ **Better mobile experience**
- ✅ **Lower hosting costs**
- ✅ **Improved SEO**

---

## Comparison: Upload vs URL

### Upload Files (Local Storage):

**Pros**:
- ✅ Full control over files
- ✅ No external dependencies
- ✅ Works offline
- ✅ Free hosting
- ✅ No third-party limits

**Cons**:
- ❌ Increases repo size
- ❌ Manual backups needed
- ❌ Limited by server storage

### Add via URL (External Hosting):

**Pros**:
- ✅ No storage on your server
- ✅ CDN delivery (faster globally)
- ✅ Easy backups (managed by service)

**Cons**:
- ❌ Depends on third-party service
- ❌ Links can break
- ❌ May have usage limits

### Recommendation:

**For now**: Use **Upload Files** (it's working perfectly!)

**Later**: Consider Cloudinary or ImgBB for production (unlimited storage, automatic optimization, CDN delivery)

---

## Summary

### ✅ What You Can Do Now:

1. **Upload images** directly from admin dashboard
2. **Images save** to `public/images/watches/` folder
3. **Drag & drop** multiple images at once
4. **Reorder and manage** images easily
5. **Images persist** across app restarts
6. **No external services** needed

### Quick Steps:

1. Login to admin
2. Add/Edit watch
3. Click "Upload Files"
4. Drag your images
5. Wait for "Uploaded X image(s)"
6. Save watch
7. Done! ✓

---

**Created**: 2025-12-11
**Feature**: Image File Upload
**Status**: ✅ Fully Working
**Storage**: `public/images/watches/`
