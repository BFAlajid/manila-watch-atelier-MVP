# Admin Login System - Testing Guide

## Admin Access Credentials

**Email:** `sherard@manilawatch.com`
**Password:** `WatchDealer2025!`

## Available Routes

1. **Admin Login Page**
   URL: `http://localhost:3001/#/admin/login`
   - Clean, professional login interface
   - Email and password fields with validation
   - Show/hide password toggle
   - Error messages for invalid credentials
   - Remember me checkbox (UI only)

2. **Admin Dashboard**
   URL: `http://localhost:3001/#/admin/dashboard`
   - Protected route (requires login)
   - Redirects to login if not authenticated

## Dashboard Features

### Stats Cards (Top Row)
- **Total Inventory**: Shows count of all watches
- **Total Value**: Displays sum of all watch prices in millions (₱)
- **Ready to Ship**: Count of Tier A watches

### Filters & Search
- **Search Bar**: Search by watch name, brand, or reference number
- **Brand Filter**: Dropdown to filter by specific brand (Rolex, Patek Philippe, etc.)
- **Tier Filter**: Filter by availability tier (A, B, C)

### Watch Management Table
Each watch row displays:
- Watch image and name
- Brand
- Reference number
- Price in PHP
- Tier badge (color-coded: Green=Tier A, Blue=Tier B, Yellow=Tier C)

**Actions Available:**
- **Edit Button** (blue): Opens edit modal (placeholder for now)
- **Delete Button** (red): Deletes watch with confirmation prompt

### Header
- Displays admin name and email
- Logout button (clears session and returns to login)

## Technical Implementation

### Authentication System
- **Session Storage**: localStorage with 24-hour expiration
- **Token-based**: Secure session tokens generated on login
- **Protected Routes**: ProtectedRoute component guards admin pages
- **Loading States**: Spinner shown while verifying authentication

### State Management
- AuthContext provides authentication state globally
- WatchProvider manages watch inventory data
- Real-time filtering and search (client-side)

### Data Source
- Watches loaded from `src/data/inventory.json`
- Now includes 4 watches with real images:
  - watch-001: Datejust 31mm Two-Tone (2 images)
  - watch-002: Datejust White Roman (1 image)
  - watch-005: Datejust Gold Champagne (1 image)
  - watch-036: Patek Philippe Nautilus (1 image)

## Testing Checklist

- [ ] Navigate to login page
- [ ] Try invalid credentials (should show error)
- [ ] Login with valid credentials
- [ ] Verify redirect to dashboard
- [ ] Check stats cards display correct numbers
- [ ] Test search functionality
- [ ] Test brand filter
- [ ] Test tier filter
- [ ] View watch images (real photos should display)
- [ ] Click Edit button (should open modal)
- [ ] Click Delete button (should show confirmation)
- [ ] Click Logout (should return to login)
- [ ] Try accessing `/admin/dashboard` without login (should redirect)

## Next Steps

### Immediate Enhancements
1. **Full Edit Modal**: Complete form with all watch fields
2. **Add Watch Modal**: Form to create new watches
3. **Image Upload**: Drag-and-drop interface for adding watch photos
4. **Persistence**: Save edits to inventory.json file
5. **Map Remaining Images**: Assign the other 28 images to correct watches

### Future Features (Per Architecture Plan)
- Multi-currency display
- Order management
- Lead management
- Analytics dashboard
- AI-powered image analysis
- Bulk upload via CSV

## File Structure

```
src/
├── lib/
│   └── auth.ts                    # Authentication logic & admin credentials
├── context/
│   └── AuthContext.tsx            # Auth state management
├── api/
│   └── admin/
│       └── auth.ts                # Login/logout API handlers
├── pages/
│   └── admin/
│       ├── Login.tsx              # Login page component
│       └── Dashboard.tsx          # Dashboard component
├── components/
│   └── admin/
│       └── ProtectedRoute.tsx     # Route guard component
└── App.tsx                        # Main app with routing
```

## Notes

- All edits are currently **in-memory only** (refresh will reset)
- Session expires after 24 hours
- Real images are stored in `/public/images/watches/`
- Figma asset placeholders used for watches without real images
