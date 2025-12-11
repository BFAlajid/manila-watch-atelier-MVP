# Complete URL Guide
**Manila Watch Atelier - All Pages & Routes**

---

## 🌐 Website URLs (Clean Paths)

### **Main Pages**

| Page | URL | Description |
|------|-----|-------------|
| **Homepage** | `/` or `/homepage` | Landing page with featured watches |
| **Inventory** | `/inventory` | Full watch catalog with filters |
| **Favorites** | `/favorites` | Saved/favorited watches |
| **Compare** | `/compare` | Compare watches side-by-side |

### **Watch Pages**

| Page | URL Format | Example |
|------|------------|---------|
| **Watch Detail** | `/watch/:slug` | `/watch/rolex-submariner-date-ceramic` |

### **Admin Pages**

| Page | URL | Access |
|------|-----|--------|
| **Admin Info** | `/admin` | Public info about admin |
| **Admin Login** | `/admin/login` | Login page |
| **Admin Dashboard** | `/admin/dashboard` | Protected (requires login) |

---

## 📋 Complete URL List

### **Customer-Facing Pages:**

```
✅ /                          → Homepage
✅ /homepage                  → Homepage (alias)
✅ /inventory                 → Watch catalog
✅ /favorites                 → Favorites page
✅ /compare                   → Comparison page
✅ /watch/[watch-slug]        → Individual watch detail

Examples:
  /watch/rolex-submariner-date-ceramic
  /watch/patek-philippe-nautilus-5711
  /watch/audemars-piguet-royal-oak
```

### **Admin Pages:**

```
✅ /admin                     → Admin information page
✅ /admin/login               → Admin login
✅ /admin/dashboard           → Admin dashboard (protected)
```

---

## 🔐 Admin Access

### **Login Page:**
- **URL:** `/admin/login`
- **Credentials:**
  - Email: `sherard@manilawatch.com`
  - Password: `WatchDealer2025!`

### **After Login:**
- Redirects to: `/admin/dashboard`
- Can manage all watches

---

## 🎯 How to Navigate

### **From Homepage:**
```
Homepage (/)
  ↓
  Click "Inventory" → /inventory
  ↓
  Click any watch → /watch/rolex-submariner-date-ceramic
```

### **To Admin:**
```
Any page
  ↓
  Navigate to /admin/login
  ↓
  Enter credentials
  ↓
  Redirects to /admin/dashboard
```

---

## 🔄 URL Changes (What I Fixed)

### **Before (HashRouter):**
```
❌ /#/                          (ugly hash)
❌ /#/inventory
❌ /#/admin/login
❌ /#/watch/rolex-submariner
```

### **After (BrowserRouter):**
```
✅ /                            (clean!)
✅ /inventory
✅ /admin/login
✅ /watch/rolex-submariner
```

---

## 📱 URL Examples

### **1. Viewing a Rolex Submariner**
```
Start: /
Click "Inventory": /inventory
Search "Submariner"
Click result: /watch/rolex-submariner-date-ceramic
```

### **2. Adding to Favorites**
```
On watch page: /watch/rolex-submariner-date-ceramic
Click heart icon (favorite)
Go to favorites: /favorites
See saved watches
```

### **3. Comparing Watches**
```
On inventory: /inventory
Select 2-3 watches for comparison
Click "Compare" button
Go to: /compare
See side-by-side comparison
```

### **4. Admin Workflow**
```
Navigate to: /admin/login
Enter credentials
Redirected to: /admin/dashboard
Click "Add New Watch"
Fill form, save
New watch appears in: /inventory
```

---

## 🌍 Full Site Map

```
Manila Watch Atelier
│
├── / (Homepage)
│   └── Featured watches, hero section
│
├── /inventory (Watch Catalog)
│   ├── Filter by brand
│   ├── Filter by price
│   ├── Search watches
│   └── Click watch → /watch/[slug]
│
├── /watch/[slug] (Watch Detail)
│   ├── Full specifications
│   ├── Image gallery
│   ├── Video player (if available)
│   ├── Add to favorites
│   ├── Add to comparison
│   └── WhatsApp inquiry
│
├── /favorites (Saved Watches)
│   ├── View all favorited watches
│   └── Remove from favorites
│
├── /compare (Compare Watches)
│   ├── Side-by-side comparison
│   └── See differences/similarities
│
└── /admin (Admin Section)
    ├── /admin (Info page)
    ├── /admin/login (Login)
    └── /admin/dashboard (Dashboard)
        ├── View inventory
        ├── Add new watch
        ├── Edit watch
        └── Delete watch
```

---

## 🔗 Deep Links

### **Share a Specific Watch:**
```
Copy URL: /watch/rolex-submariner-date-ceramic
Share via:
  - WhatsApp
  - Facebook
  - Instagram
  - Email
```

### **Direct Admin Access:**
```
Bookmark: /admin/login
Quick access to admin panel
```

---

## 🎨 URL Patterns

### **Watch Slugs:**
```
Format: [brand]-[model]-[variant]

Examples:
  rolex-submariner-date-ceramic
  rolex-daytona-panda
  patek-philippe-nautilus-5711
  audemars-piguet-royal-oak-blue
  richard-mille-rm-011
```

### **Creating Watch Slugs:**
```
When adding a watch, create slug:
  Brand: Rolex
  Model: Submariner Date
  Variant: Ceramic Black

  Slug: rolex-submariner-date-ceramic
        (lowercase, hyphens, no spaces)
```

---

## 📊 URL Status

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Working | Homepage |
| `/inventory` | ✅ Working | Full catalog |
| `/watch/:slug` | ✅ Working | Dynamic route |
| `/favorites` | ✅ Working | Saved watches |
| `/compare` | ✅ Working | Comparison |
| `/admin` | ✅ Working | Admin info |
| `/admin/login` | ✅ Working | Login page |
| `/admin/dashboard` | ✅ Working | Protected route |

---

## 🐛 Troubleshooting URLs

### **"Page not found after refresh"**
**Solution:** Added `_redirects` file for SPA routing
- All routes now redirect to `index.html`
- React Router handles client-side routing

### **"Admin redirect not working"**
**Solution:** Check login credentials
- Must use correct email/password
- Check `AuthContext` for authentication

### **"Watch page 404"**
**Solution:** Check slug format
- Must match exactly: `/watch/rolex-submariner-date-ceramic`
- Case-sensitive
- No trailing slashes

---

## ⚙️ Technical Details

### **Router Configuration:**
```typescript
// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';

// Clean URLs (no # hash)
```

### **Redirect Configuration:**
```
// public/_redirects
/* /index.html 200

// Ensures all routes work on refresh
```

### **Protected Routes:**
```typescript
// Admin dashboard requires auth
<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 🚀 Quick Reference

### **For Customers:**
```
Homepage:     /
Browse:       /inventory
Watch Detail: /watch/[slug]
Favorites:    /favorites
Compare:      /compare
```

### **For Admin (Sherard):**
```
Login:        /admin/login
Dashboard:    /admin/dashboard

Credentials:
  sherard@manilawatch.com
  WatchDealer2025!
```

---

## 📝 URL Best Practices

### **When Adding Watches:**

1. **Create SEO-friendly slugs:**
   ```
   Good: rolex-submariner-date-ceramic
   Bad: watch123, rolex-sub, rsdc
   ```

2. **Keep slugs unique:**
   ```
   rolex-submariner-date-ceramic-black
   rolex-submariner-date-ceramic-green
   ```

3. **Use lowercase with hyphens:**
   ```
   ✅ rolex-day-date-platinum
   ❌ Rolex_Day_Date_Platinum
   ```

---

## ✅ Summary

**All URLs Now Work:**
- ✅ Clean paths (no `#` hash)
- ✅ Bookmarkable
- ✅ Shareable
- ✅ SEO-friendly
- ✅ Works on refresh
- ✅ Protected admin routes

**Navigation:**
- Homepage: `/`
- Inventory: `/inventory`
- Watch: `/watch/[slug]`
- Admin: `/admin/login`

---

**Everything is ready with clean URLs!** 🎉

---

**Created:** 2025-12-11
**Router:** BrowserRouter (clean URLs)
**Status:** ✅ All routes working
