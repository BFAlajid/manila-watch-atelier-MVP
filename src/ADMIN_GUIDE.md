# Manila Watch Atelier - Admin Guide

## 🔐 Accessing the Admin Panel

### Quick Access
1. Click **"Admin"** link in the footer
2. Or navigate directly to: `#/admin` 
3. Login with credentials below

### Default Credentials
- **Username:** `admin`
- **Password:** `manila2024`

⚠️ **Important:** Change these credentials in production by editing `/components/admin/AdminLogin.tsx`

---

## 📊 Admin Dashboard

### Dashboard Statistics
The admin panel displays real-time statistics:
- **Total Inventory** - Number of watches in the system
- **In Stock** - Available watches (Tier A)
- **Total Value** - Combined value of all watches in PHP

### Features Overview
- ✅ Add new watches via form
- ✅ View all inventory in table format
- ✅ Delete watches with confirmation
- ✅ Preview watch details in modal
- ✅ Filter by tier and status
- ✅ Real-time updates (no page refresh needed)

---

## ➕ Adding a New Watch

### Step-by-Step Process

1. **Click "Add New Watch" Button**
   - Green button at the top of the inventory table

2. **Fill Out the Form**

   **Basic Information:**
   - Brand (dropdown: Rolex, Patek Philippe, AP, etc.)
   - Model (e.g., "Submariner")
   - Reference Number (e.g., "126610LN")
   - Display Name (e.g., "Submariner Date Ceramic")
   - Slug (URL: "rolex-submariner-date-ceramic")
   - Year (optional)

   **Pricing:**
   - Price in PHP (required)
   - Price in USD (optional)

   **Condition & Inventory:**
   - Condition: Brand New, Unworn, Excellent, Good
   - Tier: A (In Hand), B (Incoming), C (On Demand)
   - Availability: In Stock, Incoming, Sold, Reserved
   - Category: Sport, Luxury, Dress

   **Accessories:**
   - ☑️ Original Box
   - ☑️ Papers

   **Description:**
   - Write a compelling description highlighting:
     - Unique features
     - Condition details
     - Collector appeal
     - Provenance

   **Technical Specifications:**
   - Movement (e.g., "Caliber 3235 Automatic")
   - Case Material (e.g., "Stainless Steel 904L")
   - Diameter (e.g., "41mm")
   - Water Resistance (e.g., "300m")

   **Images:**
   - Add image paths (e.g., `/watches/image.jpg`)
   - Multiple images supported
   - First image is the main display image
   - Click "+ Add Image" for additional photos

3. **Upload Images First**
   - Place images in `/public/watches/` folder
   - Name descriptively: `rolex-submariner-001.jpg`
   - Then reference them in the form

4. **Click "Save Watch"**
   - Watch is immediately added to inventory
   - Appears on frontend without refresh

---

## 🗂️ Managing Inventory

### Inventory Table

The table displays:
- **Watch** - Thumbnail + name + brand
- **Reference** - Model reference number
- **Price** - PHP pricing
- **Tier** - A/B/C badge with color coding
- **Status** - In Stock, Incoming, Sold, Reserved
- **Actions** - View and Delete buttons

### Viewing Watch Details
1. Click the 👁️ (eye) icon
2. Modal shows:
   - Full-size image
   - All specifications
   - Description
   - Pricing and condition

### Deleting a Watch
1. Click the 🗑️ (trash) icon
2. Confirm deletion
3. Watch is removed from inventory

⚠️ **Note:** Deletions are permanent (until you clear localStorage)

---

## 💾 How Data is Stored

### LocalStorage System
- Watches are stored in browser's localStorage
- Key: `manila_watches`
- Updates persist across sessions
- Clearing browser data will reset inventory

### Data Flow
1. **Initial Load:** Reads from `/data/inventory.json` (8 Rolex watches)
2. **After Edits:** Stores in localStorage
3. **Frontend Display:** Reads from localStorage if available, falls back to JSON

### Resetting Inventory
To reset to default watches:
1. Open browser console
2. Run: `localStorage.removeItem('manila_watches')`
3. Refresh page

---

## 🔒 Security Notes

### Current Authentication
- Simple localStorage-based auth
- Session persists until logout
- No backend validation

### Production Recommendations
1. **Use Real Backend Auth:**
   - Implement JWT tokens
   - Server-side session management
   - Password hashing (bcrypt)

2. **Secure Admin Routes:**
   - Add middleware protection
   - Rate limiting on login
   - HTTPS only

3. **Change Default Password:**
   - Edit `/components/admin/AdminLogin.tsx`
   - Line 18-20: Update credentials

4. **Environment Variables:**
   - Store credentials in `.env`
   - Never commit passwords to git

---

## 🎨 Customization

### Change Admin Credentials
Edit `/components/admin/AdminLogin.tsx`:
```tsx
if (username === 'YOUR_USERNAME' && password === 'YOUR_PASSWORD') {
  // ...
}
```

### Modify Brand Options
Edit `/components/admin/AddWatchForm.tsx`:
```tsx
<option value="Your Brand">Your Brand</option>
```

### Add More Fields
1. Update `/types/inventory.ts` - Add to `Watch` interface
2. Update `/components/admin/AddWatchForm.tsx` - Add form field
3. Update `/components/admin/AdminPanel.tsx` - Display new field

---

## 🚀 Future Enhancements

Planned features for Phase 2:

1. **Edit Functionality**
   - Click on watch to edit details
   - Update existing entries

2. **Image Upload**
   - Direct file upload from admin panel
   - Automatic image optimization
   - Cloud storage integration

3. **Bulk Actions**
   - Import/export watches as CSV/JSON
   - Bulk delete or update
   - Duplicate watches

4. **Advanced Filtering**
   - Search by any field
   - Sort by price, date, tier
   - Filter by multiple criteria

5. **Analytics**
   - Sales tracking
   - Price history
   - Inventory turnover

6. **Backend Integration**
   - PostgreSQL database
   - REST API
   - Real-time sync across devices

---

## ❓ Troubleshooting

### "Invalid credentials" Error
- Check username: `admin` (case-sensitive)
- Check password: `manila2024`
- Clear browser cache if persistent

### Watch Not Appearing After Add
- Check browser console for errors
- Verify all required fields filled
- Try refreshing page
- Check localStorage: `localStorage.getItem('manila_watches')`

### Images Not Loading
- Verify images are in `/public/watches/` folder
- Check file path in form (starts with `/watches/`)
- Check image file names (no spaces)
- Try absolute URL for testing

### Lost All Watches
- LocalStorage was cleared
- Run: `localStorage.removeItem('manila_watches')`
- Refresh to reload from JSON
- Consider backing up localStorage data

---

## 📞 Support

For issues or feature requests:
- Check `/ADDING_WATCHES.md` for detailed guides
- Review `/types/inventory.ts` for data structure
- Contact developer for custom features

---

**Built with ❤️ for Manila Watch Atelier**
