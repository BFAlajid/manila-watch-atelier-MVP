# 🧪 Complete Testing Checklist

**Dev Server**: http://localhost:3002
**Test Date**: December 10, 2025
**Tester**: Pre-delivery QA

---

## 🏠 Homepage Testing

### Visual Elements
- [ ] Header loads with logo and navigation
- [ ] Hero section displays correctly
- [ ] Currency selector visible in header
- [ ] Theme toggle (light/dark) works
- [ ] Product grid shows 6 watches
- [ ] Recent Activity Feed displays in sidebar
- [ ] Recent Activity updates every 30 seconds
- [ ] Footer with all social links
- [ ] Dealer section with Sherard's info
- [ ] All animations smooth (no jank)

### Functionality
- [ ] Click currency selector → dropdown opens
- [ ] Select different currency → prices update
- [ ] Refresh page → selected currency persists
- [ ] Click theme toggle → colors change
- [ ] Click watch card → navigates to detail page
- [ ] Click "View All Inventory" → goes to inventory page
- [ ] Instagram link opens https://www.instagram.com/manilawatchatelier/
- [ ] Facebook link opens https://www.facebook.com/sherard.ng
- [ ] Messenger button opens chat

### Psychological UX
- [ ] Social proof badges appear on product cards
- [ ] FOMO indicators show on some watches
- [ ] Scarcity counters display viewer numbers
- [ ] Recent Activity Feed shows realistic data
- [ ] All animations trigger correctly

---

## 📦 Inventory Page Testing

### Visual Elements
- [ ] All watches display in grid
- [ ] Search bar visible
- [ ] Filter options (brand, category, price) visible
- [ ] Sorting dropdown works
- [ ] Pagination if needed

### Functionality
- [ ] Search for "Rolex" → filters correctly
- [ ] Select brand filter → shows only that brand
- [ ] Sort by price (high to low) → reorders
- [ ] Click watch → goes to detail page
- [ ] Add to favorites → heart fills
- [ ] Add to comparison → button state changes

### Psychological UX
- [ ] Badges display on all cards
- [ ] FOMO indicators appear
- [ ] Scarcity visible on Tier A watches

---

## ⌚ Watch Detail Page Testing

### Visual Elements
- [ ] Main image loads (high quality)
- [ ] Thumbnail gallery displays
- [ ] FOMO + Social Proof badges at top
- [ ] Price displays in selected currency
- [ ] Scarcity indicator shows viewer count
- [ ] Urgency timer appears (if applicable)
- [ ] Specifications table complete
- [ ] Customer testimonial rotates
- [ ] Trust badge section visible

### Functionality
- [ ] Click thumbnails → main image changes
- [ ] Favorite button → adds to favorites
- [ ] Share button → opens share options
- [ ] Copy reference → copies to clipboard
- [ ] "Inquire Now" → opens modal
- [ ] WhatsApp button → opens WhatsApp with pre-filled message
- [ ] Add to comparison → works
- [ ] Payment calculator shows breakdown
- [ ] Navigate back → returns to previous page

### Currency Conversion
- [ ] Change currency in header → detail page price updates
- [ ] Payment calculator amounts convert
- [ ] WhatsApp message includes correct currency

### Psychological UX
- [ ] Scarcity numbers fluctuate realistically
- [ ] Urgency timer counts down
- [ ] Testimonials rotate every 8 seconds
- [ ] Social proof badges appropriate for brand

---

## 💰 Currency System Testing

### Supported Currencies
Test with these currencies:
- [ ] PHP (Philippine Peso) ₱
- [ ] USD (US Dollar) $
- [ ] EUR (Euro) €
- [ ] GBP (British Pound) £
- [ ] JPY (Japanese Yen) ¥ (no decimals)
- [ ] SGD (Singapore Dollar) S$
- [ ] HKD (Hong Kong Dollar) HK$
- [ ] AUD (Australian Dollar) A$

### Functionality
- [ ] Open currency dropdown → all 20 currencies listed
- [ ] Search currency → filters list
- [ ] Select currency → all prices update immediately
- [ ] Refresh page → currency selection persists
- [ ] Navigate between pages → currency stays selected
- [ ] JPY/KRW display without decimals
- [ ] Large numbers (VND/IDR) format correctly

### Exchange Rates
- [ ] Open DevTools Console
- [ ] Check for "Exchange rates loaded successfully"
- [ ] Verify rates cached (check localStorage)
- [ ] Rates don't refetch on every page load

---

## 🔐 Admin Dashboard Testing

### Login
- [ ] Navigate to http://localhost:3002/#/admin/login
- [ ] "Back to Website" button works
- [ ] Enter wrong password → error message
- [ ] Enter correct credentials → redirects to dashboard
  - Email: sherard@manilawatch.com
  - Password: WatchDealer2025!

### Dashboard
- [ ] Stats cards display correctly
  - Total watches count
  - Total value (PHP)
  - Tier A count
  - Tier B/C count
- [ ] Watch table loads all watches
- [ ] Search box filters watches
- [ ] Brand filter works
- [ ] Tier filter works
- [ ] View button opens watch details (modal or page)
- [ ] Edit button placeholder works
- [ ] Delete button shows confirmation

### Security
- [ ] Try accessing /admin/dashboard without login → redirects to login
- [ ] Logout button clears session
- [ ] After logout, cannot access dashboard

---

## 🎨 Theme System Testing

### Light Mode
- [ ] Toggle to light mode
- [ ] Background changes to white
- [ ] Text changes to dark
- [ ] All components visible
- [ ] Refresh → theme persists

### Dark Mode
- [ ] Toggle to dark mode
- [ ] Background changes to black
- [ ] Text changes to light
- [ ] All components visible
- [ ] Psychological badges still readable

---

## 📱 Mobile Responsive Testing

Test on different viewport sizes:

### Mobile (375px - 480px)
- [ ] Header navigation collapses to hamburger
- [ ] Product grid shows 1 column
- [ ] Watch detail images stack vertically
- [ ] Currency selector works
- [ ] Footer columns stack
- [ ] Recent Activity Feed moves to bottom
- [ ] Buttons are tappable (min 44px)

### Tablet (768px - 1024px)
- [ ] Product grid shows 2 columns
- [ ] Header shows some navigation items
- [ ] Watch detail uses 2-column layout
- [ ] All psychological components visible

### Desktop (1280px+)
- [ ] Product grid shows 3-4 columns
- [ ] Full navigation visible
- [ ] Recent Activity sidebar sticky
- [ ] All hover effects work

---

## ⚡ Performance Testing

### Page Load
- [ ] Homepage loads in < 2 seconds
- [ ] Inventory page loads in < 2.5 seconds
- [ ] Watch detail page loads in < 2 seconds
- [ ] No layout shift on load
- [ ] Images lazy load

### Animations
- [ ] All animations smooth (60fps)
- [ ] No stuttering on scroll
- [ ] Hover effects responsive
- [ ] Psychological counters don't cause lag

### Lighthouse Audit
Run `npm run build` then test production build:
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

---

## 🐛 Error Handling

### Missing Data
- [ ] Watch with no image → shows placeholder
- [ ] Watch with missing specs → doesn't crash
- [ ] Empty search results → shows message

### Network Errors
- [ ] Disable network → exchange rates use fallback
- [ ] Slow connection → shows loading states

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🔗 Links & Navigation

### Internal Links
- [ ] Logo → Homepage
- [ ] Navigation items → Correct pages
- [ ] Product cards → Detail pages
- [ ] Breadcrumbs → Previous page
- [ ] Footer links → Correct pages
- [ ] Admin link → Login page

### External Links
- [ ] Instagram → https://www.instagram.com/manilawatchatelier/
- [ ] Facebook → https://www.facebook.com/sherard.ng
- [ ] Messenger → Opens chat
- [ ] WhatsApp → Opens with message
- [ ] All open in new tab with `target="_blank"`

---

## 🎯 Psychological UX Specific Tests

### ScarcityIndicator
- [ ] Shows "X people viewing now" (1-8)
- [ ] Shows "X inquiries this week" (5-19)
- [ ] Numbers fluctuate every 8-12 seconds
- [ ] "High demand" appears when 3+ viewers
- [ ] Only shows on Tier A watches

### SocialProofBadge
- [ ] "Top Seller" badge (20% chance)
- [ ] "Trending" badge (25% for Rolex/Patek/AP)
- [ ] "Verified Authentic" (luxury brands)
- [ ] "New Arrival" (Brand New condition)
- [ ] Multiple badges can appear together

### UrgencyTimer
- [ ] Countdown displays correctly
- [ ] Numbers animate on change
- [ ] Timer types vary by tier:
  - Tier A: Price increase countdown
  - Tier B: Arrival countdown
  - Tier C: Sourcing window
- [ ] Contextual messages appear

### FOMOIndicator
- [ ] "Newly acquired X days ago"
- [ ] "Back in stock"
- [ ] "Last viewed X minutes ago"
- [ ] "Limited quantity"
- [ ] Auto-dismisses where appropriate

### RecentActivityFeed
- [ ] Shows 5 recent activities
- [ ] Activities include: viewed, inquired, purchased
- [ ] Realistic locations (Manila, Singapore, etc.)
- [ ] Updates every 30 seconds
- [ ] Animations smooth

### TestimonialSnippet
- [ ] Displays customer review
- [ ] Shows 5 stars
- [ ] Rotates every 8 seconds
- [ ] Smooth transitions
- [ ] Brand-specific testimonials

### MicroInteractions
- [ ] Confetti on favorite (if integrated)
- [ ] Success toast appears
- [ ] Hover animations smooth
- [ ] No performance impact

---

## ✅ Critical Issues (Must Fix)

**Found Issues:**
1. _[List any critical bugs here]_
2. _[...]_

---

## ⚠️ Minor Issues (Nice to Fix)

**Found Issues:**
1. _[List any minor bugs here]_
2. _[...]_

---

## 💡 Improvements Noted

**Suggestions:**
1. _[List any improvement ideas here]_
2. _[...]_

---

## 📊 Test Results Summary

**Total Tests**: 200+
**Passed**: ___
**Failed**: ___
**Skipped**: ___

**Overall Status**: 🟢 PASS / 🟡 PASS WITH ISSUES / 🔴 FAIL

**Ready for Delivery**: ☐ YES / ☐ NO (requires fixes)

---

**Tested By**: _____________
**Date**: December 10, 2025
**Time Spent**: ___ hours
**Next Steps**: ___________
