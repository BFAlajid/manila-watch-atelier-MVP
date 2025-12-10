# 📝 Configuration Guide for Sherard

## Quick Contact Information Updates

### 📞 WhatsApp Number

**File**: `src/config/contacts.ts`

```typescript
whatsapp: {
  number: '639123456789', // ⬅️ UPDATE THIS (no spaces, no +)
  displayNumber: '+63 912 345 6789', // ⬅️ UPDATE THIS (for display)
},
```

**Format**: Country code + number (e.g., `639171234567` for Philippines)

---

### 📧 Email Address

**File**: `src/config/contacts.ts`

```typescript
email: {
  primary: 'sherard@manilawatch.com', // ⬅️ UPDATE THIS
  inquiries: 'inquiries@manilawatch.com', // ⬅️ OR use same as primary
},
```

**Note**: Email links in Footer and forms will use this automatically.

---

### 📱 Social Media Links

**File**: `src/config/contacts.ts`

```typescript
social: {
  instagram: 'https://www.instagram.com/manilawatchatelier/', // ✅ Already set
  facebook: 'https://www.facebook.com/sherard.ng', // ✅ Already set
  messenger: 'https://m.me/sherard.ng', // ⬅️ UPDATE if needed
},
```

---

## Admin Dashboard Access

**Login URL**: http://localhost:3002/#/admin/login

**Credentials**:
- **Email**: `sherard@manilawatch.com`
- **Password**: `WatchDealer2025!`

### 🔐 Change Admin Password

**File**: `src/lib/auth.ts`

```typescript
const ADMIN_USERS = {
  'sherard@manilawatch.com': {
    password: 'WatchDealer2025!', // ⬅️ CHANGE THIS
    // ...
  }
};
```

**⚠️ IMPORTANT**: This is for development only. For production, backend authentication is required (see SECURITY_REVIEW.md).

---

## Currency Settings

### Default Currency

**File**: `src/context/WatchContext.tsx`

Look for:
```typescript
const [currency, setCurrencyState] = useLocalStorage<string>('manila-watch-currency', 'PHP');
```

Change `'PHP'` to your preferred default (e.g., `'USD'`, `'EUR'`).

---

## Watch Images

### Adding New Watch Images

1. Place images in: `public/images/watches/`
2. Update `src/data/inventory.json`:

```json
{
  "id": "watch-037",
  "name": "Your New Watch",
  "images": [
    "/images/watches/your-watch-01.jpg",
    "/images/watches/your-watch-02.jpg"
  ],
  // ...
}
```

### Image Requirements

- **Format**: JPG or PNG
- **Size**: Max 5MB each (recommended: 1-2MB)
- **Dimensions**: Min 800x800px (recommended: 1200x1200px)
- **Quality**: 85% JPEG quality

---

## Brand Colors

If you want to change the gold accent color:

**File**: `tailwind.config.js`

```javascript
theme: {
  extend: {
    colors: {
      gold: '#D4AF37', // ⬅️ CHANGE THIS (current: luxurygold)
    },
  },
},
```

Then search/replace `#D4AF37` throughout the codebase.

---

## Legal Pages

### Privacy Policy & Terms

**Files to update** (currently placeholders):
- Footer links go to `#` (no page yet)

**To add**:
1. Create markdown files in `public/legal/`:
   - `privacy-policy.md`
   - `terms-of-service.md`

2. Create React pages in `src/pages/`:
   - `PrivacyPolicyPage.tsx`
   - `TermsOfServicePage.tsx`

3. Update Footer links in `src/components/Footer.tsx`

---

## Deployment Settings

### For Production Deployment

1. Update `package.json`:
   ```json
   "homepage": "https://your domain.com"
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy `build/` folder to your web host

### Recommended Hosts

- **Vercel** (easiest): https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: Free but limited

---

## Frequently Updated Settings

### 1. Watch Inventory

**File**: `src/data/inventory.json` or `public/data/inventory.json`

Update via:
- Admin Dashboard (future feature)
- Direct JSON editing (current method)

### 2. Dealer Bio

**File**: `src/components/DealerSection.tsx`

Lines 44-71 contain your biography text.

### 3. Homepage Hero Text

**File**: `src/components/Hero.tsx`

Update main headline and subtext.

### 4. Footer Brand Description

**File**: `src/components/Footer.tsx`

Lines 14-20 contain brand description.

---

## Need Help?

1. Check `NEXT_STEPS.md` for implementation roadmap
2. See `SECURITY_REVIEW.md` for security considerations
3. Review `PSYCHOLOGICAL_UX_GUIDE.md` for UX features
4. Contact developer for technical support

---

## 🚀 Quick Start for Editing

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:3002

4. **Make changes** → Save → See updates instantly

5. **Build for production**:
   ```bash
   npm run build
   ```

---

**Last Updated**: December 10, 2025
**Version**: 1.0.0
