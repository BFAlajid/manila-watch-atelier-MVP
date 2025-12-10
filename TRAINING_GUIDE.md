# 🎓 Training Guide - Manila Watch Atelier

**For**: Sherard W Ng
**Purpose**: Learn to manage your luxury watch website
**Duration**: 1-2 hours
**Format**: Hands-on walkthrough

---

## 📋 Pre-Training Checklist

Before we start, make sure you have:
- [ ] Computer with internet connection
- [ ] Modern web browser (Chrome, Firefox, or Safari)
- [ ] Admin login credentials handy
- [ ] Questions or concerns written down
- [ ] 1-2 hours of uninterrupted time

---

## Part 1: Website Tour (20 minutes)

### 1.1 Homepage Features

**Let's explore**: http://localhost:3002

#### Navigation Bar (Top)
- **Logo**: Click to return home from anywhere
- **Navigation**: Home | Inventory | About | Admin
- **Currency Selector**: Change between 20 currencies
  - Try: Click dropdown → Select EUR → Watch prices update!
- **Theme Toggle**: Switch between light/dark mode
  - Try: Click sun/moon icon → See colors change!

#### Hero Section
- Large welcome banner
- Call-to-action buttons
- Professional imagery

#### Product Grid
- Shows 6 featured watches
- Each card displays:
  - Watch image (hover for effects!)
  - Brand name
  - Model name
  - Price (in selected currency)
  - Social proof badges
  - Viewer counts (live simulation)

**Try This**:
1. Hover over a watch → See shine effect
2. Click "View Details" → Goes to full watch page
3. Click heart icon → Add to favorites
4. Change currency → Prices update immediately

#### Recent Activity Feed (Right Sidebar)
- Shows simulated live activity
- "Someone from Singapore viewed Rolex..."
- Updates every 30 seconds
- Creates FOMO (fear of missing out)

#### Footer
- Contact links (Instagram, Facebook, Email)
- Brand information
- Services offered
- Legal links (placeholders for now)

---

### 1.2 Inventory Page

**Navigate to**: Click "Inventory" in menu

#### Features
- All 36 watches displayed in grid
- Search bar at top
- Filter options (coming soon)
- Each watch shows:
  - Tier badge (A/B/C)
  - Social proof (Trending, Top Seller, etc.)
  - Current availability

**Try This**:
1. Scroll through all watches
2. Click any watch → See full details
3. Notice different tier badges:
   - Green = Tier A (In Hand)
   - Blue = Tier B (Incoming)
   - Yellow = Tier C (On Request)

---

### 1.3 Watch Detail Page

**Navigate to**: Click any watch from inventory

#### What You'll See

**Top Section**:
- Large product image
- Thumbnail gallery (click to change main image)
- Favorite & Share buttons
- FOMO indicators ("Newly acquired 3 days ago")
- Social proof badges

**Watch Information**:
- Brand & Model name
- Reference number (with copy button)
- View counter
- **Price** (in selected currency)
- Scarcity indicator ("3 people viewing now")
- Urgency timer (if applicable)

**Details**:
- Condition (Excellent, Brand New, etc.)
- Availability (In Hand, Incoming, On Demand)
- Box & Papers status (✓ if included)

**Action Buttons**:
- "Inquire Now" → Opens contact form
- WhatsApp button → Opens chat with pre-filled message
- Add to Comparison → Compare with other watches

**More Information**:
- Payment Calculator → Shows payment options
- Description → Detailed watch info
- Specifications → Technical details
- Customer Reviews → Rotating testimonials
- Trust Badge → Authenticity guarantee

**Try This**:
1. Click through all 6 thumbnail images
2. Copy the reference number
3. Click WhatsApp → See pre-filled message
4. Change currency → Price updates
5. Watch testimonials rotate (every 8 seconds)

---

## Part 2: Currency System (10 minutes)

### 2.1 How It Works

The website supports **20 currencies**:
- PHP (Philippine Peso) - Default
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- And 15 more...

### 2.2 Features

**Auto-Detection**:
- Website detects visitor's location
- Sets default currency automatically
- Philippines → PHP, USA → USD, etc.

**Live Exchange Rates**:
- Rates update every hour automatically
- Pulled from real exchange rate API
- Cached for performance

**Persistence**:
- Selected currency saves in browser
- Refreshing page keeps currency choice
- Works across all pages

### 2.3 Using Currency Selector

**Try This Full Workflow**:
1. Note current price of any watch
2. Click currency dropdown (top right)
3. Search "EUR" in search box
4. Click Euro (€)
5. Watch ALL prices update instantly
6. Navigate to different page → Currency persists
7. Refresh browser → Still Euro!

---

## Part 3: Admin Dashboard (30 minutes)

### 3.1 Accessing Admin

**URL**: http://localhost:3002/#/admin/login

**Login Credentials**:
- Email: `sherard@manilawatch.com`
- Password: `WatchDealer2025!`

**Security Note**: This is development-only. For public website, backend authentication required (see Security Review doc).

### 3.2 Dashboard Overview

After login, you'll see:

**Stats Cards** (Top):
- Total Watches: Count of all watches
- Total Value: Sum in PHP
- Tier A (In Hand): Ready to ship count
- Tier B/C: Incoming/On Demand count

**Watch Management Table**:
- Lists all 36 watches
- Shows: Image, Brand, Model, Reference, Price, Tier
- Actions: View, Edit (placeholder), Delete

### 3.3 Searching & Filtering

**Search Bar**:
- Type brand name (e.g., "Rolex")
- Type model (e.g., "Submariner")
- Type reference number (e.g., "116610")
- Results filter instantly

**Brand Filter**:
- Dropdown shows all brands
- Select "Rolex" → Shows only Rolex watches
- Select "All Brands" → Shows everything

**Tier Filter**:
- Filter by availability
- A = In Hand
- B = Incoming
- C = On Demand

**Try This**:
1. Search "Rolex"
2. Filter by Tier A
3. Click "View" on any watch
4. Navigate back
5. Clear search
6. Try different filters

### 3.4 Viewing Watch Details

Click "View" button on any watch:
- See all watch information
- Same layout as public view
- Quick reference for customer inquiries

### 3.5 Logout

- Click "Logout" button (top right)
- Clears session
- Returns to login page
- Must re-login to access dashboard

---

## Part 4: Managing Content (30 minutes)

### 4.1 Updating Watch Information

**Current Method**: Edit JSON file
**Future Feature**: In-dashboard editing

**File Location**: `src/data/inventory.json`

**Structure**:
```json
{
  "id": "watch-001",
  "brand": "Rolex",
  "name": "Submariner Date",
  "reference": "116610LN",
  "price_php": 850000,
  "images": [
    "/images/watches/watch-001-front.jpg"
  ],
  "tier": "A",
  "condition": "Excellent",
  "box": true,
  "papers": true,
  // ...more fields
}
```

**What You Can Update**:
- `name`: Watch model name
- `price_php`: Price in Philippine Pesos
- `tier`: "A", "B", or "C"
- `condition`: "Brand New", "Excellent", "Good"
- `box`: true or false
- `papers`: true or false
- `description`: Watch description text
- `specifications`: Technical details

**⚠️ Be Careful With**:
- `id`: Don't change (breaks links)
- `slug`: Don't change (breaks URLs)
- JSON syntax: Must be valid (commas, quotes)

### 4.2 Adding New Watches

**Steps**:
1. Prepare watch images (1200x1200px recommended)
2. Place in `public/images/watches/`
3. Copy an existing watch entry in JSON
4. Update all fields
5. Generate new unique `id` (e.g., "watch-037")
6. Save file
7. Refresh website → New watch appears!

**Naming Convention for Images**:
- `watch-037-front.jpg`
- `watch-037-side.jpg`
- `watch-037-back.jpg`
- `watch-037-box.jpg`

### 4.3 Updating Contact Information

**File**: `src/config/contacts.ts`

**What to Update**:
```typescript
// WhatsApp number
whatsapp: {
  number: '639123456789', // ⬅️ YOUR NUMBER HERE
  displayNumber: '+63 912 345 6789',
},

// Email
email: {
  primary: 'sherard@manilawatch.com', // ⬅️ YOUR EMAIL
},
```

**After updating**:
- All WhatsApp buttons use new number
- All email links use new address
- No need to change multiple places!

### 4.4 Changing Admin Password

**File**: `src/lib/auth.ts`

Find:
```typescript
const ADMIN_USERS = {
  'sherard@manilawatch.com': {
    password: 'WatchDealer2025!', // ⬅️ CHANGE THIS
  }
};
```

**Remember**:
- This is dev-only security
- For production, backend required
- Don't share password publicly

---

## Part 5: Troubleshooting (15 minutes)

### Common Issues & Solutions

#### "Website not loading"
- Check: Is dev server running?
- Solution: Run `npm run dev` in terminal
- URL: http://localhost:3002

#### "Currency not updating"
- Check: Is currency selector clicking?
- Solution: Refresh page, try different currency
- Check: Browser console for errors

#### "Images not showing"
- Check: Are images in `public/images/watches/`?
- Check: Is path correct in JSON?
- Solution: Verify image filename matches exactly

#### "Admin login not working"
- Check: Correct email and password?
- Email: sherard@manilawatch.com
- Password: WatchDealer2025!
- Try: Copy-paste to avoid typos

#### "Prices look wrong"
- Check: Currency setting (top right)
- Check: `price_php` in JSON is in pesos
- Solution: Verify exchange rates loaded

### Getting Help

1. Check relevant documentation:
   - `CONFIGURATION_GUIDE.md`
   - `ADMIN_LOGIN_GUIDE.md`
   - `CURRENCY_FIX_GUIDE.md`

2. Check browser console:
   - Right-click → Inspect → Console tab
   - Look for red errors

3. Contact developer:
   - Email: [Developer Email]
   - Include: Screenshot of error
   - Include: What you were doing when error occurred

---

## Part 6: Best Practices (10 minutes)

### DO's ✅

1. **Always test changes locally first**
   - Make change
   - Check website works
   - Then deploy to production

2. **Keep backups of JSON files**
   - Before editing, save a copy
   - Name: `inventory-backup-2025-12-10.json`

3. **Use high-quality images**
   - Min 800x800px
   - Professional photography
   - Good lighting

4. **Update prices regularly**
   - Check market values
   - Update JSON file
   - Refresh website

5. **Test on mobile**
   - Open on phone
   - Check all features work
   - Ensure text is readable

### DON'Ts ❌

1. **Don't delete `id` or `slug` fields**
   - Breaks links and favorites
   - Can corrupt data

2. **Don't break JSON syntax**
   - Missing comma = error
   - Wrong quote type = error
   - Use JSON validator if unsure

3. **Don't use admin in production without backend**
   - Password visible to anyone
   - Not secure for public use
   - See SECURITY_REVIEW.md

4. **Don't upload huge images**
   - Max 5MB per image
   - Slows down website
   - Optimize before uploading

5. **Don't ignore browser console errors**
   - Red text = problem
   - Check and fix before continuing

---

## Part 7: Quick Reference (5 minutes)

### Key URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:3002/ |
| Inventory | http://localhost:3002/#/inventory |
| Admin Login | http://localhost:3002/#/admin/login |
| Admin Dashboard | http://localhost:3002/#/admin/dashboard |

### Key Files to Update

| What | File |
|------|------|
| Watch inventory | `src/data/inventory.json` |
| Contact info | `src/config/contacts.ts` |
| Admin password | `src/lib/auth.ts` |
| Watch images | `public/images/watches/` |

### Key Commands

| Task | Command |
|------|---------|
| Start website | `npm run dev` |
| Build for production | `npm run build` |
| Stop server | Press Ctrl+C in terminal |

### Quick Tips

💡 **Currency**: Default is PHP, auto-detects visitor location
💡 **Psychological Features**: All automatic, seed-based for consistency
💡 **Mobile**: Everything responsive, works on all devices
💡 **Theme**: Users can toggle light/dark mode
💡 **Admin**: Dev-only, backend needed for production

---

## 🎉 You're Ready!

**Congratulations**! You now know how to:
- ✅ Navigate the entire website
- ✅ Use the currency system
- ✅ Access admin dashboard
- ✅ Search and filter watches
- ✅ Update basic content
- ✅ Troubleshoot common issues

### Next Steps

1. **Practice**: Spend 30 minutes clicking around
2. **Make a change**: Update one watch price
3. **Test currency**: Try all 20 currencies
4. **Explore admin**: Search, filter, view watches
5. **Ask questions**: Write down anything unclear

### Remember

- 📚 All documentation in project folder
- 🆘 Developer support available
- 🔄 Changes only live after `npm run build` + deploy
- 🔐 Backend needed for production security

---

## 📞 Post-Training Support

**Included (2 weeks)**:
- Email support
- Bug fixes
- Minor tweaks
- Follow-up questions

**After 2 weeks**:
- Hourly rate: ₱1,500/hour
- Monthly retainer: ₱10,000/month

---

**Training Complete!** 🎓

**Questions?** → Contact developer
**Ready to launch?** → Review deployment options
**Need more features?** → See NEXT_STEPS.md

---

**Last Updated**: December 10, 2025
**Version**: 1.0.0
