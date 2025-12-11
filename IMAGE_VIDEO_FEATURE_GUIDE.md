# Image & Video Management Guide
## Manila Watch Atelier Admin Features

---

## Overview

Your admin dashboard now has two powerful new features:

1. **Image Gallery Manager** - Manage multiple images with drag-to-reorder, thumbnails, and easy uploads
2. **Video Embedding** - Add Facebook videos, YouTube videos, or direct uploads to watch listings

---

## 🖼️ Feature 1: Image Gallery Manager

### What It Does

- **View all images** for a watch in a collapsible dropdown
- **Add images** via URL or file upload (drag & drop supported)
- **Reorder images** by dragging them
- **Set primary image** (first image shows on product cards)
- **Remove images** easily
- **Live preview** of the primary image

### How to Use

#### When Adding/Editing a Watch:

1. **Scroll to "Image Gallery" section** in the add/edit watch form
2. **Click the dropdown arrow** (▼) to expand the gallery
3. Choose your upload method:
   - **Add via URL**: Paste image URLs (local or external)
   - **Upload Files**: Drag & drop or click to browse

#### Adding Images via URL:

```
1. Click "Add via URL" button
2. Paste the image path:
   - Local: /images/watches/rolex-submariner.jpg
   - External: https://example.com/watch-photo.jpg
3. Press Enter or click "Add"
```

#### Uploading Image Files:

```
1. Click "Upload Files" button
2. Either:
   - Drag & drop image files into the upload area
   - Click "Choose Files" to browse
3. Images will be added to the gallery
```

**Note:** File uploads currently save references only. For production, you'll need to implement actual upload to a storage service (Uploadthing, Cloudinary, etc.).

#### Managing Images:

- **Reorder**: Click and drag the grip icon (≡) to rearrange
- **Set as Primary**: Click the star icon (⭐) on any image to make it the main image
- **Remove**: Click the X button to delete an image
- **Primary Image**: Always marked with a yellow border and "Primary Image" badge

### Tips

✅ **First image = Primary image** - This shows on product cards and thumbnails
✅ **Drag to reorder** - Move the best photo to the top
✅ **Upload multiple images** - Showcase different angles, details, box & papers
✅ **Use high-quality images** - Recommended: 1200x1200px or larger

---

## 🎥 Feature 2: Video Embedding

### What It Does

Adds video presentations to watch listings. The video appears **first** when customers view a watch, before the image gallery.

Supports:
- ✅ **Facebook videos** (from Sherard's profile or posts)
- ✅ **YouTube videos**
- ✅ **Direct video URLs** (MP4, WebM)
- ✅ **Manual uploads** (for local video files)

### How to Use

#### When Adding/Editing a Watch:

1. **Scroll to "Product Video" section**
2. **Choose video source** (4 options):
   - YouTube
   - Facebook
   - URL (direct link)
   - Upload (file)

---

### Option 1: Facebook Video (RECOMMENDED for Sherard)

#### Step-by-Step:

1. **Click the "Facebook" button** in the video source options
2. **Go to Sherard's Facebook profile** or the post with the watch video
3. **Copy the video URL**:
   - On desktop: Right-click video → "Copy video URL"
   - On mobile: Tap Share → Copy Link
4. **Paste the URL** into the "Facebook Video URL" field
5. **Video will auto-preview** below

#### Facebook URL Examples:

```
✅ Valid formats:
https://www.facebook.com/sherard.ng/videos/123456789
https://www.facebook.com/watch/?v=123456789
https://fb.watch/abc123

❌ Invalid:
- Private videos (must be public)
- Facebook Stories (not supported)
- Live videos (only after they're saved as posts)
```

#### Requirements for Facebook Videos:

⚠️ **IMPORTANT**: The Facebook video MUST be:
- **Public** (not friends-only or private)
- **Posted on Sherard's profile or page**
- **Not deleted or archived**

If the video is private, it won't embed properly. Make sure to check privacy settings on Facebook.

---

### Option 2: YouTube Video

1. **Click the "YouTube" button**
2. **Copy any YouTube URL** (watch, share, or embed format)
3. **Paste into the field**
4. System auto-converts to embed format

#### YouTube URL Examples:

```
✅ All these work:
https://www.youtube.com/watch?v=abc123
https://youtu.be/abc123
https://www.youtube.com/embed/abc123
```

---

### Option 3: Direct Video URL

For videos hosted on your own server or external CDN:

1. **Click the "URL" button**
2. **Paste the direct video file URL**
3. Must be a video file (MP4, WebM, etc.)

```
Example:
https://cdn.example.com/videos/rolex-submariner.mp4
```

---

### Option 4: Upload Video File

1. **Click the "Upload" button**
2. **Choose a video file** or drag & drop
3. Supported formats: MP4, WebM, MOV
4. Max size: 100MB (configurable)

**Note:** Like image uploads, this currently creates a reference. For production, implement upload to storage service.

---

### Custom Thumbnail (Optional)

You can set a custom video thumbnail:

1. **Scroll to "Custom Thumbnail" field**
2. **Paste an image URL** (e.g., `/images/thumbnails/rolex-video-thumb.jpg`)
3. If not provided, system will auto-generate:
   - YouTube: Uses YouTube's thumbnail
   - Others: Uses first watch image

---

## 🎬 How Videos Appear on the Website

### Customer Experience:

1. **Customer clicks on a watch** in the inventory
2. **Video appears FIRST** with a play button overlay
3. **Click to play** - Video plays in an embedded player
4. **Image gallery appears below** the video
5. **Fullscreen option** available for better viewing

### Features for Customers:

- ✨ **Auto-thumbnail** with golden play button
- ✨ **Smooth animations** when clicking play
- ✨ **Fullscreen mode** for immersive viewing
- ✨ **Fallback to images** if no video

---

## 📱 How to Get Facebook Video URLs

### Desktop (Easiest):

```
1. Go to facebook.com/sherard.ng (or the post)
2. Find the video
3. Right-click on the video
4. Click "Copy video URL"
5. Paste into admin dashboard
```

### Mobile:

```
1. Open Facebook app
2. Find the video on Sherard's profile
3. Tap the video
4. Tap the Share button (arrow icon)
5. Tap "Copy Link"
6. Paste into admin dashboard
```

### From a Facebook Post:

```
1. Open the post with the video
2. Click the timestamp (e.g., "2 hours ago")
3. Copy the URL from the browser
4. It will look like:
   https://www.facebook.com/sherard.ng/videos/123456789
5. Paste into admin dashboard
```

---

## ✅ Best Practices

### For Images:

1. **Use 4-8 images per watch**
   - Main hero shot (dial close-up)
   - Full watch on wrist or stand
   - Case back
   - Movement (if open case back)
   - Box & papers
   - Side profile
   - Clasp/buckle details

2. **Image quality**:
   - Minimum: 1000x1000px
   - Recommended: 1500x1500px
   - Format: JPG (best quality/size ratio)
   - File size: Under 2MB per image

3. **Ordering**:
   - Put the BEST image first (hero shot)
   - Show dial/face in first 2-3 images
   - End with box & papers

### For Videos:

1. **Video content**:
   - 30-90 seconds ideal length
   - Show watch from multiple angles
   - Highlight unique features
   - Show wrist presence/size
   - Include box & papers if complete set

2. **Facebook videos** (Recommended):
   - Upload directly to Sherard's Facebook
   - Set to PUBLIC
   - Add watch details in description
   - Use for customer engagement + website

3. **Video quality**:
   - 1080p (Full HD) minimum
   - Good lighting (natural or studio)
   - Stable footage (use tripod or stabilization)
   - Clear audio (if narrating)

---

## 🐛 Troubleshooting

### Images Not Showing:

**Problem**: Image appears broken or doesn't load

**Solutions**:
1. Check the file path is correct
2. Ensure image is in `/public/images/watches/` folder
3. Verify image file exists
4. Check file extension (.jpg, .png, .webp)
5. Try using ImageWithFallback component (already implemented)

### Facebook Video Not Embedding:

**Problem**: Video URL doesn't work

**Solutions**:
1. ✅ Check video is PUBLIC (not friends-only)
2. ✅ Verify URL format is correct
3. ✅ Try copying URL again from Facebook
4. ✅ Test video in Facebook's embed tester:
   https://developers.facebook.com/tools/debug/

### Video Not Playing:

**Problem**: Video thumbnail shows but won't play

**Solutions**:
1. Check internet connection
2. Verify video URL is still valid
3. Try refreshing the page
4. Check browser console for errors (F12)
5. Test in different browser

### Upload Not Working:

**Problem**: File upload fails or doesn't save

**Solution**:
Currently, file uploads create references only. For production:
1. Set up Uploadthing account (free tier: 2GB)
2. Add API keys to `.env`
3. Implement upload logic in the admin form

---

## 🎯 Example Workflow: Adding a Rolex with Video

### Complete Example:

```
1. Login to admin dashboard
2. Click "Add New Watch"
3. Fill in basic details:
   - Brand: Rolex
   - Model: Submariner Date
   - Reference: 126610LN
   - Name: Submariner Date Ceramic Black
   - Price: ₱1,050,000

4. Scroll to Image Gallery
5. Click expand (▼)
6. Click "Add via URL"
7. Add 6 images:
   /images/watches/sub-dial.jpg (primary)
   /images/watches/sub-wrist.jpg
   /images/watches/sub-caseback.jpg
   /images/watches/sub-clasp.jpg
   /images/watches/sub-box.jpg
   /images/watches/sub-papers.jpg

8. Scroll to Product Video
9. Click "Facebook"
10. Go to Sherard's Facebook post
11. Copy video URL
12. Paste: https://www.facebook.com/sherard.ng/videos/123456789
13. Preview appears

14. Save watch
15. Test on frontend - video shows first, then images below
```

---

## 💡 Pro Tips

### For Maximum Impact:

1. **Always add videos** for high-value watches (₱2M+)
2. **Use Facebook videos** - easier to manage, already posted for marketing
3. **Keep thumbnails clean** - auto-generated usually works best
4. **Order images strategically** - best shot first
5. **Update videos regularly** - keep content fresh
6. **Cross-promote** - same video on Facebook, Instagram, and website

### SEO Benefits:

- Videos increase time-on-page (Google ranking factor)
- Better engagement = better conversion rates
- Videos appear in Google Video search
- Rich snippets for watch listings

---

## 📊 Summary

| Feature | Status | How to Use |
|---------|--------|------------|
| Image Gallery | ✅ Ready | Expand dropdown, drag to reorder |
| Facebook Videos | ✅ Ready | Copy URL from Sherard's profile |
| YouTube Videos | ✅ Ready | Paste any YouTube URL |
| Direct Video URL | ✅ Ready | Paste MP4/WebM link |
| Manual Upload | ⚠️ Reference Only | Needs storage service for production |
| Auto Thumbnails | ✅ Ready | Automatic from first image or YouTube |
| Video-First Display | ✅ Ready | Shows before images on watch page |

---

## 🚀 Next Steps

### For Demo (Now):
- ✅ Test adding images via URL
- ✅ Test embedding Facebook videos from Sherard's profile
- ✅ Verify everything displays correctly on frontend

### For Production (Later):
- Set up Uploadthing for real file uploads
- Configure video storage (optional)
- Add video conversion/optimization
- Implement progress indicators for uploads

---

**Need Help?**

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify file paths and URLs
3. Test with different watches
4. Contact developer with specific error messages

---

**Created**: 2025-12-11
**Version**: 1.0
**Status**: Ready for Testing
