# Fresh Start Guide
**Manila Watch Atelier - Clean Slate Setup**

---

## ✅ What Just Happened

### **All Watches & Images Cleared**

**Inventory Status:**
- ✅ **src/data/inventory.json** - Empty `[]`
- ✅ **public/data/inventory.json** - Empty `[]`
- ✅ **Admin Dashboard** - Will show 0 watches
- ✅ **Frontend** - Will show empty inventory

**Result:** Complete clean slate! 🎉

---

## 🔐 Admin Login Info

### **How to Access Admin Dashboard:**

1. **Go to:** `http://localhost:5173/admin/login` (or your deployed URL + `/admin/login`)

2. **Login Credentials:**
   - **Email:** `sherard@manilawatch.com`
   - **Password:** `WatchDealer2025!`

3. **After Login:** You'll be redirected to the admin dashboard

### **Admin Routes:**
```
/admin          → Info page about admin
/admin/login    → Login page (start here!)
/admin/dashboard → Dashboard (requires login)
```

---

## 🎯 What You'll See Now

### **Admin Dashboard:**
```
Total Inventory: 0
In Stock: 0
Total Value: ₱0.0M

[Add New Watch] button

Empty table with message:
"No watches in inventory"
"Click 'Add New Watch' to get started"
```

### **Frontend (Customer View):**
```
Inventory Page: Empty
Home Page: No featured watches
Search: No results
```

---

## 🚀 Getting Started from Scratch

### **Step 1: Login to Admin**
```
1. Navigate to: /admin/login
2. Enter credentials (sherard@manilawatch.com / WatchDealer2025!)
3. Click "Sign In"
4. You'll see the admin dashboard
```

### **Step 2: Add Your First Watch**
```
1. Click "Add New Watch" button
2. Fill in all required fields:
   - Brand: Rolex, Patek Philippe, etc.
   - Model: Submariner, Daytona, etc.
   - Reference: 126610LN
   - Name: Display name for the watch
   - Price (PHP): Required
   - Condition: excellent, brand_new, etc.
   - Tier: A (In Hand), B (Incoming), C (On Demand)
   - Category: Sport, Luxury, Dress
   - Description: Detailed description
   - Specifications: Movement, case material, diameter, water resistance

3. Add Images:
   - Click to expand "Image Gallery"
   - Choose "Add via URL" or "Upload Files"
   - Add 4-8 images per watch
   - Drag to reorder (first image = primary)

4. Add Video (Optional):
   - Click to expand "Product Video"
   - Choose source: Facebook, YouTube, URL, or Upload
   - Paste video URL
   - Preview appears

5. Click "Save Watch"

6. Watch appears in inventory!
```

### **Step 3: Build Your Inventory**
```
Recommended approach:
- Day 1: Add 2-3 high-value watches
- Day 2: Add 3-5 more watches
- Day 3: Add videos to top watches
- Day 4-7: Complete inventory
- Week 2: Test, refine, launch
```

---

## 📸 Image Best Practices

### **For Each Watch, Upload:**
1. **Hero shot** (dial close-up) - PRIMARY
2. **Wrist shot** (show size/presence)
3. **Case back** (show movement if open)
4. **Side profile**
5. **Clasp/bracelet detail**
6. **Box & papers** (if included)
7. **Additional angles** (bezel, crown, etc.)

### **Image Specs:**
- **Format:** JPG (best quality/size ratio)
- **Resolution:** 1200x1200px minimum
- **File size:** Under 2MB per image
- **Lighting:** Natural or studio (avoid harsh shadows)
- **Background:** Clean, neutral (white/gray/black)

---

## 🎥 Video Best Practices

### **Recommended Content:**
- **Duration:** 30-90 seconds
- **Quality:** 1080p minimum
- **Show:**
  - 360° rotation on watch stand
  - Dial close-up
  - Wrist presence
  - Box & papers unboxing (if new)
  - Unique features (complications, dial details)

### **Where to Host:**
1. **Facebook** (Recommended)
   - Post to Sherard's profile
   - Set to PUBLIC
   - Copy video URL
   - Paste in admin dashboard

2. **YouTube**
   - Upload to channel
   - Set to Unlisted or Public
   - Copy URL
   - Paste in admin dashboard

---

## 🔄 Workflow Example

### **Adding a Rolex Submariner:**

```
1. Login to Admin Dashboard

2. Click "Add New Watch"

3. Fill Basic Info:
   Brand: Rolex
   Model: Submariner Date
   Reference: 126610LN
   Name: Submariner Date Ceramic Black
   Slug: rolex-submariner-date-ceramic

4. Pricing:
   Price PHP: 1050000
   Price USD: 18500 (optional)
   Year: 2021

5. Condition & Status:
   Condition: excellent
   Box: ✓ Yes
   Papers: ✓ Yes
   Tier: A (In Hand)
   Availability: in_stock
   Category: Sport

6. Description:
   "The legendary Rolex Submariner Date with modern ceramic bezel.
   This iconic dive watch features a black dial, date function with
   Cyclops lens, and the highly sought-after Cerachrom bezel insert
   that's virtually scratch-proof. Complete with original box and
   papers dated 2021. A timeless investment piece in excellent
   condition."

7. Specifications:
   Movement: Caliber 3235 Automatic
   Case Material: Stainless Steel 904L
   Diameter: 41mm
   Water Resistance: 300m

8. Images (expand gallery):
   - Add 6 images via URL or upload
   - Drag first image to be hero shot
   - Remove any unwanted images

9. Video (optional):
   - Select "Facebook"
   - Paste: https://www.facebook.com/sherard.ng/videos/123456789
   - Preview appears

10. Click "Save Watch"

11. Watch now visible in inventory! ✅
```

---

## 💾 Data Persistence

### **How Data is Saved:**

**Current Setup (Demo):**
- Changes saved to **localStorage** (browser storage)
- Data persists during session
- **Reloading page clears localStorage** (loads fresh from inventory.json)
- To keep changes permanently → Export or implement backend

**Future (Production):**
- Changes saved to **database** (Vercel Postgres)
- Data persists permanently
- Multi-user support
- Automatic backups

---

## 🐛 Troubleshooting

### **"I don't see my changes"**
- Admin dashboard auto-clears localStorage on load
- This ensures fresh data from inventory.json
- Your session changes are temporary
- For permanent storage → Implement backend

### **"Can't login to admin"**
- Check URL: Must be `/admin/login`
- Credentials:
  - Email: `sherard@manilawatch.com`
  - Password: `WatchDealer2025!`
- Clear browser cache if needed

### **"Images not showing"**
- Verify image files are in `/public/images/watches/`
- Check file path starts with `/images/watches/`
- Check file exists and has correct extension
- Test image URL in browser

### **"Video not embedding"**
- Facebook: Must be PUBLIC (not friends-only)
- YouTube: Any visibility works
- Check URL is complete and correct
- Test video URL in browser

---

## 📊 Current Status

| Item | Status |
|------|--------|
| **Inventory** | ✅ Empty (0 watches) |
| **Admin Login** | ✅ Working |
| **Admin Dashboard** | ✅ Dark mode, ready to use |
| **Add Watch** | ✅ Fully functional |
| **Edit Watch** | ✅ Fully functional |
| **Delete Watch** | ✅ Working |
| **Image Gallery** | ✅ Drag-drop, reorder, delete |
| **Video Manager** | ✅ Facebook, YouTube, Upload |
| **Frontend** | ✅ Ready (will show when you add watches) |

---

## 🎯 Next Steps

### **Immediate (Today):**
1. ✅ Login to admin dashboard
2. ✅ Test adding one watch
3. ✅ Verify it appears on frontend
4. ✅ Test editing the watch
5. ✅ Test deleting the watch

### **This Week:**
1. Add 5-10 watches with real photos
2. Add videos to top 3 watches
3. Test all features
4. Show to Sherard for approval

### **Before Launch:**
1. Add all inventory (20-30 watches)
2. Optimize images
3. Add videos to all watches
4. Test on mobile
5. Deploy to production
6. Implement backend (optional)

---

## 🔐 Security Note

### **Important:**
The admin credentials are hardcoded for demo purposes:
- Email: `sherard@manilawatch.com`
- Password: `WatchDealer2025!`

**Before going live:**
- Change the password
- Implement proper authentication
- Use environment variables
- Add password reset functionality

**For now (demo):**
- Keep credentials private
- Don't share publicly
- Use only for testing

---

## 📞 Support

### **Common Questions:**

**Q: Where do I upload images?**
A: Put them in `/public/images/watches/` folder, then reference as `/images/watches/filename.jpg`

**Q: How do I embed Facebook videos?**
A: Copy video URL from Facebook, paste in admin dashboard under "Product Video" → "Facebook"

**Q: Changes don't persist after refresh?**
A: Currently using localStorage which clears on reload. Implement backend for permanent storage.

**Q: Can I add watches from my phone?**
A: Yes! Admin dashboard is mobile-responsive. Login and add watches from any device.

---

## ✅ Summary

**What's Ready:**
- ✅ Clean inventory (0 watches)
- ✅ Admin login working
- ✅ Admin dashboard (dark mode)
- ✅ Add/Edit/Delete watches
- ✅ Image gallery manager
- ✅ Video embedding system
- ✅ Frontend ready to display

**What to Do:**
1. Login at `/admin/login`
2. Add your first watch
3. Test all features
4. Start building inventory

**Login Info:**
- URL: `/admin/login`
- Email: `sherard@manilawatch.com`
- Password: `WatchDealer2025!`

---

**You're all set! Start fresh and build your inventory one watch at a time.** 🚀

---

**Created:** 2025-12-11
**Status:** ✅ Ready to Use
**Inventory:** 0 watches (clean slate)
