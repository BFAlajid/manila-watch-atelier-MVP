# Product Image Guide for Manila Watch Atelier

## ✅ **Placeholder Images Removed!**

All Unsplash placeholder URLs have been removed. Watches now use proper file paths that you can easily replace with your actual product photos.

---

## 📸 **How to Add Your Watch Photos**

### **Step 1: Prepare Your Images**
1. Take high-quality photos of each watch
2. Use consistent lighting and background
3. Recommended dimensions: **800x800px** or larger
4. Save as: **JPG** or **PNG** format
5. Optimize file size (under 500KB per image)

### **Step 2: Name Your Files**
Use the same filename as shown in the inventory:

```
/public/watches/datejust-champagne.jpg
/public/watches/datejust-anniversary-diamonds.jpg
/public/watches/datejust-big-diamonds.jpg
/public/watches/datejust-silver-jubilee.jpg
/public/watches/datejust-black-diamonds.jpg
/public/watches/datejust-champagne-jubilee.jpg
/public/watches/datejust-16030-tuxedo.jpg
/public/watches/datejust-16013-buckley.jpg
/public/watches/datejust-small-diamonds.jpg
/public/watches/datejust-super-oyster.jpg
/public/watches/datejust-rose-gold-black.jpg
/public/watches/datejust-motif-dial.jpg
/public/watches/gmt-master-ii-pepsi.jpg
/public/watches/milgauss-gv.jpg
/public/watches/oyster-perpetual-green.jpg
/public/watches/air-king-126900.jpg
/public/watches/daytona-zenith-panda.jpg
/public/watches/submariner-16610.jpg
/public/watches/submariner-bluesy-gold.jpg
/public/watches/daytona-rose-gold.jpg
/public/watches/submariner-kermit.jpg
/public/watches/sky-dweller.jpg
/public/watches/gmt-batgirl-rootbeer.jpg
/public/watches/daytona-white-gold-oysterflex.jpg
/public/watches/submariner-1680.jpg
```

### **Step 3: Upload to Public Folder**
1. Create folder: `/public/watches/` (if it doesn't exist)
2. Copy your images into this folder
3. Ensure filenames match exactly (case-sensitive!)

### **Step 4: Verify**
1. Visit your site
2. Check if images load correctly
3. Images that don't load will show a generic fallback

---

## 🎯 **What's Already Done**

### **Watches WITH Images (from Figma):**
- ✅ Datejust 31mm Two-Tone (watch-001)
- ✅ Air-King 40mm (watch-002)
- ✅ Sea-Dweller 43mm (watch-003)
- ✅ Submariner Date Ceramic (watch-004)
- ✅ Day-Date Full Gold Diamonds (watch-005)
- ✅ Milgauss Black Dial GV (watch-006)
- ✅ Submariner No-Date Black (watch-007)
- ✅ Daytona Two-Tone Diamonds (watch-008)
- ✅ Submariner Two-Tone Bluesy (watch-023)
- ✅ Submariner 41mm Date Black SET (watch-024)
- ✅ Patek Nautilus Tiffany Blue (watch-036)

**Total: 11 watches have real images**

### **Watches NEEDING Images:**
- ⏳ 25 Datejust, GMT, Sports models (watches 9-22, 25-35)

---

## 💡 **Quick Tips**

### **Batch Processing**
If you have all photos, rename them in bulk:
```bash
# Example: Rename all at once
mv photo1.jpg datejust-champagne.jpg
mv photo2.jpg datejust-anniversary-diamonds.jpg
...
```

### **Image Optimization Tools**
- **TinyPNG** - https://tinypng.com (compress without quality loss)
- **Squoosh** - https://squoosh.app (Google's image optimizer)
- **ImageOptim** - Mac app for batch optimization

### **Watermarking (Optional)**
Consider adding your logo/watermark to:
- Prevent unauthorized use
- Build brand recognition
- Add "Manila Watch Atelier" text

---

## 🔄 **Alternative: Use Admin Panel**

Instead of manual file upload, you can:

1. Go to `#/admin`
2. Login with `admin` / `manila2024`
3. Click on a watch
4. Delete it
5. Re-add it with **"Add New Watch"**
6. Upload image URL or path

---

## 📋 **Current Image Status**

| Status | Count | Details |
|--------|-------|---------|
| ✅ Real Images | 11 | From Figma imports |
| ⏳ Need Images | 25 | Placeholder paths set |
| **Total** | **36** | **All watches** |

---

## 🎨 **Image Best Practices**

### **Recommended Specs:**
- **Format:** JPG (photos) or PNG (if transparency needed)
- **Size:** 800x800px to 1200x1200px
- **Aspect Ratio:** 1:1 (square) or 4:5 (portrait)
- **File Size:** 200-500KB (optimized)
- **Background:** White or neutral gray
- **Lighting:** Even, no harsh shadows

### **Multiple Angles (Optional):**
You can add multiple images per watch:
```json
"images": [
  "/watches/submariner-front.jpg",
  "/watches/submariner-side.jpg",
  "/watches/submariner-clasp.jpg",
  "/watches/submariner-wrist.jpg"
]
```

---

## ✨ **Fallback System**

Don't worry if you don't have all photos immediately! The site has a **fallback system**:

1. If image path exists → Shows your photo
2. If image missing → Shows generic watch placeholder
3. Site still functions perfectly either way

---

## 📞 **Need Help?**

If you need assistance with:
- Batch image renaming
- Image optimization
- Watermarking automation
- Bulk upload script

Just let me know!

---

**Ready to add your photos? Just copy them to `/public/watches/` with the correct filenames and you're done!** 🎉
