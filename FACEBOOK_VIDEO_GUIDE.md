# Facebook Video Embedding Guide

## How to Embed Facebook Videos/Reels

Your Manila Watch Atelier now supports Facebook video embedding! Here's how to use it.

---

## Quick Steps

1. **Go to your Facebook video/reel**
2. **Click the three dots (⋯)** at the top right
3. **Select "Embed"** from the dropdown
4. **Copy the entire `<iframe>` code** that Facebook shows you
5. **Go to Admin Dashboard** → Edit your watch
6. **Scroll to "Product Video"** section
7. **Select "Facebook"** as video type
8. **Paste the entire iframe code** (or just the reel URL)
9. **Save the watch**

---

## Example: What to Paste

### Option 1: Full iframe code (RECOMMENDED)

```html
<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1147416423820368%2F&show_text=false&width=267&t=0" width="267" height="476" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>
```

The system will automatically extract the `src` URL.

### Option 2: Just the reel URL

```
https://www.facebook.com/reel/1147416423820368/
```

The system will convert it to the proper embed format.

### Option 3: Already have the embed src URL

```
https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1147416423820368%2F&show_text=false&width=267&t=0
```

This works too!

---

## Important Requirements

### Video Must Be PUBLIC

- Your Facebook video/reel **must be set to Public** (globe icon 🌐)
- Private or friends-only videos will show "Video Unavailable"
- Check your video's privacy settings before embedding

### Get Embed Code from Facebook

Always get the embed code directly from Facebook:
1. Open your video on Facebook
2. Click three dots (⋯) → "Embed"
3. Copy the code Facebook generates

**Don't use share URLs like:**
- ❌ `https://www.facebook.com/share/v/17wEkMoa4N/`

**Use the full reel URL instead:**
- ✅ `https://www.facebook.com/reel/1147416423820368/`

---

## How It Works

### Auto-Detection

The VideoManager automatically:
1. Detects if you pasted full `<iframe>` code
2. Extracts the `src` URL from the iframe
3. Converts reel URLs to proper embed format
4. Validates the URL format

### What Gets Saved

Your input → What's saved:

```
Input:  https://www.facebook.com/reel/1147416423820368/
Saved:  https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1147416423820368%2F&show_text=false&width=500
```

---

## Troubleshooting

### "Video Unavailable" Error

**Causes:**
- Video is not public (check privacy settings)
- Video was deleted
- Video belongs to a private account/page
- Wrong video ID/URL

**Fix:**
1. Make sure video is set to **Public** on Facebook
2. Get fresh embed code from Facebook (three dots → Embed)
3. Paste the new code in admin panel
4. Save and refresh the page

### Video not showing after saving

**Fix:**
1. Hard refresh the page: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Check browser console for errors
3. Verify the video URL in inventory.json is correct
4. Make sure the dev server is running (`npm run dev:api`)

### Can't find "Embed" option

**Causes:**
- Video is not public
- You're viewing from mobile (use desktop)
- Video was uploaded as a Story (can't be embedded)

**Fix:**
- Switch to desktop browser
- Make video public
- Use a regular video/reel post (not Story)

---

## Video Display

### Where Videos Appear

Your Facebook video will be displayed:
1. **Watch Detail Page** - Large video player at the top
2. **Play button overlay** - On the video thumbnail
3. **Fullscreen mode** - Click maximize button

### Player Features

- ✅ Play button overlay
- ✅ Autoplay on click
- ✅ Fullscreen support
- ✅ Facebook's native controls
- ✅ Mobile responsive

---

## Best Practices

### Video Quality

- Use high-quality videos (1080p recommended)
- Vertical format works well (9:16 aspect ratio)
- Keep videos under 2 minutes for best engagement

### Content Tips

- Show watch from multiple angles
- Include close-ups of details
- Demonstrate features (rotating bezel, etc.)
- Show wrist shots for size reference
- Include box and papers if available

### Privacy Settings

**Always double-check:**
1. Open your video on Facebook
2. Look for privacy icon (should be 🌐 globe)
3. If it shows friends/custom icon, change to Public
4. Save and get new embed code

---

## Admin Panel Updates

### New Features

The VideoManager now has:
- ✅ **Textarea input** - Paste entire iframe codes easily
- ✅ **Auto-extraction** - Automatically extracts src from iframe
- ✅ **Better instructions** - Step-by-step guide in the UI
- ✅ **Multiple formats** - Accepts reel URLs, embed URLs, or iframe code

### Using the Admin Panel

1. Go to: `http://localhost:3000/admin/login`
2. Login with your credentials
3. Click "Add New Watch" or edit existing
4. Scroll to "Product Video" section
5. Select "Facebook" tab
6. Paste your Facebook embed code or reel URL
7. Preview appears automatically
8. Click "Save Watch"

---

## Example Workflow

### Full Example: Adding a Watch with Facebook Video

**Step 1: Record your watch video**
- Use phone camera (vertical orientation)
- Show watch dial, case, bracelet, papers
- Keep it under 1 minute

**Step 2: Upload to Facebook**
- Post as Public reel or video
- Add caption with watch details
- Make sure privacy is set to **Public**

**Step 3: Get embed code**
- Open the video on Facebook
- Click three dots (⋯)
- Select "Embed"
- Copy the entire `<iframe>` code

**Step 4: Add to admin panel**
- Open Manila Watch Atelier admin
- Edit your watch or create new one
- Go to "Product Video" section
- Select "Facebook"
- Paste the iframe code
- See preview load automatically
- Save watch

**Step 5: View on site**
- Go to watch detail page
- Video appears at top
- Click play to watch
- Click fullscreen for bigger view

Done! 🎉

---

## Technical Details

### Supported URL Formats

```javascript
// All of these work:

// 1. Full iframe code
<iframe src="https://www.facebook.com/plugins/video.php?..." ...></iframe>

// 2. Embed plugin URL
https://www.facebook.com/plugins/video.php?height=476&href=...

// 3. Reel URL
https://www.facebook.com/reel/1147416423820368/

// 4. Video URL
https://www.facebook.com/videos/1234567890/

// 5. Watch URL
https://www.facebook.com/watch/?v=1234567890
```

### Code Implementation

The system uses:
- **VideoManager.tsx** - Handles URL conversion and iframe extraction
- **WatchVideoPlayer.tsx** - Displays the video with play button
- **Facebook Plugins API** - Official Facebook embed system

---

## Summary

### ✅ What Works Now

1. Paste entire `<iframe>` embed code → Automatically extracts src
2. Paste reel URL → Converts to embed format
3. Paste embed URL → Uses as-is
4. Video must be Public → Displays perfectly
5. Preview in admin → See it before saving
6. Responsive display → Works on mobile and desktop

### 📋 Quick Checklist

Before embedding a Facebook video:
- [ ] Video is set to **Public** on Facebook
- [ ] Got embed code from Facebook (three dots → Embed)
- [ ] Copied entire `<iframe>` code or reel URL
- [ ] Pasted into admin panel under "Facebook" video type
- [ ] Saw preview load successfully
- [ ] Saved the watch
- [ ] Refreshed watch detail page to view

---

**Created**: 2025-12-11
**Feature**: Facebook Video Embedding
**Status**: ✅ Fully Working
**Video Type**: Reels, Videos, Public Posts
