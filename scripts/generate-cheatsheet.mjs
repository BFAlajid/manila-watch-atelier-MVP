import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, TabStopPosition, TabStopType,
  PageBreak,
} from 'docx';
import fs from 'fs';

// ── Helpers ──────────────────────────────────────────────────────────
const gold = 'D4AF37';
const darkBg = '1A1A1A';
const white = 'FFFFFF';
const gray = '999999';
const lightGray = 'F5F5F5';
const codeBg = 'F0F0F0';

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: level === HeadingLevel.HEADING_1 ? gold : '333333', font: 'Segoe UI', size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24 })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Segoe UI', size: 20, color: '333333', ...opts })],
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, font: 'Segoe UI', size: 20, color: '222222' });
}

function code(text) {
  return new Paragraph({
    spacing: { after: 40 },
    shading: { type: ShadingType.CLEAR, fill: codeBg },
    children: [new TextRun({ text, font: 'Consolas', size: 18, color: '333333' })],
  });
}

function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { after: 0 },
    shading: { type: ShadingType.CLEAR, fill: codeBg },
    indent: { left: 200 },
    children: [new TextRun({ text: line, font: 'Consolas', size: 17, color: '333333' })],
  }));
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 40 },
    children: [new TextRun({ text, font: 'Segoe UI', size: 20, color: '333333' })],
  });
}

function bulletBold(label, desc) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [
      new TextRun({ text: label, bold: true, font: 'Segoe UI', size: 20, color: '222222' }),
      new TextRun({ text: ` — ${desc}`, font: 'Segoe UI', size: 20, color: '555555' }),
    ],
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(text => new TableCell({
      shading: isHeader ? { type: ShadingType.CLEAR, fill: darkBg } : undefined,
      width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({
          text: String(text),
          bold: isHeader,
          font: isHeader ? 'Segoe UI' : 'Segoe UI',
          size: isHeader ? 20 : 19,
          color: isHeader ? gold : '333333',
        })],
      })],
    })),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r)),
    ],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

// ── Document ─────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Segoe UI', size: 20 },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 720, bottom: 720, left: 900, right: 900 },
      },
    },
    children: [

      // ═══ COVER / TITLE ═══
      new Paragraph({ spacing: { before: 1200 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'MANILA WATCH ATELIER', bold: true, font: 'Segoe UI', size: 56, color: gold })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: 'Complete Codebase Cheat Sheet', font: 'Segoe UI', size: 28, color: gray })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: 'React + TypeScript + Vite + Tailwind CSS + Vercel', font: 'Consolas', size: 20, color: '666666' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, font: 'Segoe UI', size: 20, color: gray })],
      }),

      // ═══ 1. PROJECT STACK ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('1. Project Stack'),
      makeTable(
        ['Technology', 'Version', 'Role'],
        [
          ['React', '18.3', 'UI framework'],
          ['TypeScript', '5.x', 'Type safety'],
          ['Vite', '6.3.5', 'Build tool + dev server'],
          ['Tailwind CSS', 'v4', 'Utility-first styling'],
          ['Radix UI', '30+ components', 'Headless UI primitives (Shadcn)'],
          ['Framer Motion', 'motion/react', 'Animations & page transitions'],
          ['Express', '5.2', 'Local dev API server'],
          ['Vercel Serverless', '-', 'Production API functions'],
          ['Resend', '6.6', 'Email notifications'],
          ['Recharts', '2.15', 'Data visualization charts'],
          ['Lucide React', '0.487', 'SVG icon library'],
          ['Sharp + SVGO', '-', 'Build-time image optimization'],
        ]
      ),

      // ═══ 2. NPM SCRIPTS ═══
      spacer(),
      heading('2. NPM Scripts'),
      ...codeBlock([
        'npm run dev            # Runs Vite + dev-server.js concurrently',
        'npm run dev:frontend   # Vite dev server only (port 5173)',
        'npm run dev:api        # Express API only (port 3001)',
        'npm run build          # vite build → outputs to build/',
        'npm run test           # Vitest unit tests',
        'npm run test:e2e       # Playwright E2E tests',
      ]),

      // ═══ 3. DIRECTORY STRUCTURE ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('3. Directory Structure'),
      heading('api/ — Vercel Serverless Functions (Production Backend)', HeadingLevel.HEADING_3),
      makeTable(
        ['File', 'Method', 'Purpose'],
        [
          ['auth.js', 'POST', 'Admin login — SHA-256 hash verification'],
          ['watches.ts', 'GET', 'List watches with filters (brand, price, status, etc.)'],
          ['watches/[slug].ts', 'GET/PUT/DELETE', 'Single watch: view, update, mark as SOLD'],
          ['watches/create.ts', 'POST', 'Admin: create new watch'],
          ['inquiries.ts', 'POST/GET', 'Submit inquiry (public) / List all (admin)'],
          ['inquiries/[id].ts', 'PUT', 'Admin: update inquiry status'],
          ['upload-image.js', 'POST', 'Multipart image upload (max 10MB)'],
          ['sitemap.xml.ts', 'GET', 'Auto-generated XML sitemap'],
          ['_lib/data.ts', '-', 'Reads src/data/inventory.json (replaces Prisma)'],
          ['_lib/auth.ts', '-', 'Token verification helper'],
        ]
      ),

      spacer(),
      heading('src/context/ — Global State (React Context)', HeadingLevel.HEADING_3),
      makeTable(
        ['File', 'Purpose'],
        [
          ['WatchContext.tsx', 'Favorites, comparison, currency, recently viewed, exchange rates'],
          ['AuthContext.tsx', 'Admin authentication state + login/logout'],
          ['ThemeContext.tsx', 'Light / dark mode toggle'],
        ]
      ),

      spacer(),
      heading('src/pages/ — Route-Level Components', HeadingLevel.HEADING_3),
      makeTable(
        ['File', 'Route', 'Purpose'],
        [
          ['HomePage.tsx', '/', 'Landing — Hero + ProductGrid(6) + TrustBadges + RecentlyViewed'],
          ['InventoryPage.tsx', '/inventory', 'Full catalog with all filters'],
          ['WatchDetailPage.tsx', '/watch/:slug', 'Single watch — images, specs, inquiry, share, video'],
          ['ComparePage.tsx', '/compare', 'Side-by-side comparison table (max 3)'],
          ['FavoritesPage.tsx', '/favorites', 'Saved/favorited watches grid'],
          ['InsightsPage.tsx', '/insights', 'Market insights and analytics'],
          ['BrandPage.tsx', '/watches/:brand', 'Brand-filtered catalog'],
          ['SoldArchivePage.tsx', '/sold', 'Sold watches archive (grayscale)'],
          ['admin/Login.tsx', '/admin/login', 'Admin login form'],
          ['admin/Dashboard.tsx', '/admin/dashboard', 'Full CRUD + analytics + CRM + bulk actions'],
          ['NotFoundPage.tsx', '*', '404 page'],
        ]
      ),

      spacer(),
      heading('src/components/ — Reusable Components', HeadingLevel.HEADING_3),
      makeTable(
        ['Component', 'Purpose'],
        [
          ['Header.tsx', 'Nav bar — sticky, responsive, currency selector, mobile menu'],
          ['Hero.tsx', 'Landing hero with CTA buttons'],
          ['ProductGrid.tsx', 'Watch grid + category/brand/price filters + search'],
          ['ProductCard.tsx', 'Single card — hover zoom, FOMO badge, favorite/compare buttons'],
          ['InquiryModal.tsx', 'Contact form modal (name, email, phone, message)'],
          ['SearchBar.tsx', 'Cmd+K / slash search modal with typeahead'],
          ['FavoriteButton.tsx', 'Heart toggle — syncs to localStorage'],
          ['ComparisonButton.tsx', 'Add to compare (max 3)'],
          ['ComparisonBar.tsx', 'Floating sticky compare bar at bottom'],
          ['WhatsAppButton.tsx', 'Floating WhatsApp CTA (bottom-right)'],
          ['SocialShareButtons.tsx', 'Facebook, Twitter, Email, Copy Link'],
          ['AppointmentBooking.tsx', 'Date/time booking modal for viewings'],
          ['WatchRequestForm.tsx', 'Sourcing request form (brand/model/budget)'],
          ['NewsletterSignup.tsx', 'Email capture in Footer'],
          ['RecentlyViewed.tsx', 'Carousel of last 8 viewed watches'],
          ['CurrencySelector.tsx', '20 currencies dropdown with auto-detect'],
          ['TrustBadges.tsx', 'Authenticity guarantee indicators'],
          ['DealerSection.tsx', 'Sherard contact info block'],
          ['SEOHead.tsx', 'Dynamic meta/OG tags per page'],
          ['OptimizedImage.tsx', 'Lazy loading + async decoding wrapper'],
          ['ImageLightbox.tsx', 'Fullscreen image viewer with zoom'],
          ['WatchVideoPlayer.tsx', 'Facebook embedded video player'],
          ['ScrollProgress.tsx', 'Page scroll progress indicator bar'],
        ]
      ),

      spacer(),
      heading('src/components/psychology/ — Conversion Psychology', HeadingLevel.HEADING_3),
      makeTable(
        ['Component', 'Purpose'],
        [
          ['FOMOIndicator.tsx', '"Last viewed X min ago", "Newly acquired"'],
          ['ScarcityIndicator.tsx', '"Only 1 piece available", tier badges'],
          ['SocialProofBadge.tsx', '"Someone from Manila viewed..." activity feed'],
          ['UrgencyTimer.tsx', 'Countdown-style urgency display'],
        ]
      ),

      spacer(),
      heading('Other Key Files', HeadingLevel.HEADING_3),
      makeTable(
        ['File', 'Purpose'],
        [
          ['src/data/inventory.json', 'THE watch catalog — source of truth for all data'],
          ['src/lib/currency.ts', 'Exchange rates API, conversion, formatting (20 currencies)'],
          ['src/lib/utils.ts', 'cn() — Tailwind classname merge helper'],
          ['src/config/contacts.ts', 'Phone, email, social media links'],
          ['src/hooks/useLocalStorage.ts', 'Custom hook for persistent state'],
          ['src/types/inventory.ts', 'TypeScript interfaces for Watch & Inquiry'],
          ['dev-server.js', 'Local Express API — full CRUD with JSON files'],
          ['vercel.json', 'Vercel deployment config — rewrites, functions, memory'],
          ['vite.config.ts', 'Build config — React SWC, image optimizer, aliases'],
          ['public/manifest.json', 'PWA manifest — app name, icons, theme color'],
          ['public/sw.js', 'Service worker — cache-first images, network-first pages'],
        ]
      ),

      // ═══ 4. ROUTING ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('4. Routing (App.tsx)'),
      para('All routes are wrapped in AnimatePresence for fade transitions. Pages are lazy-loaded with React.lazy().'),
      spacer(),
      makeTable(
        ['Path', 'Component', 'Auth'],
        [
          ['/', 'HomePage', 'Public'],
          ['/inventory', 'InventoryPage', 'Public'],
          ['/watch/:slug', 'WatchDetailPage', 'Public'],
          ['/watches/:brand', 'BrandPage', 'Public'],
          ['/insights', 'InsightsPage', 'Public'],
          ['/compare', 'ComparePage', 'Public'],
          ['/favorites', 'FavoritesPage', 'Public'],
          ['/sold', 'SoldArchivePage', 'Public'],
          ['/privacy-policy', 'PrivacyPolicyPage', 'Public'],
          ['/terms-of-service', 'TermsOfServicePage', 'Public'],
          ['/admin/login', 'AdminLogin', 'Public'],
          ['/admin/dashboard', 'Dashboard', 'ProtectedRoute (Bearer token)'],
          ['*', 'NotFoundPage', 'Public'],
        ]
      ),
      spacer(),
      para('Fixed UI on every page:'),
      bullet('ComparisonBar — sticky footer (shows when watches added to compare)'),
      bullet('WhatsAppButton — floating bottom-right CTA'),
      bullet('Toaster — Sonner toast notifications'),

      // ═══ 5. API ENDPOINTS ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('5. API Endpoints'),
      heading('Public Endpoints (no auth required)', HeadingLevel.HEADING_3),
      makeTable(
        ['Method', 'Endpoint', 'Purpose'],
        [
          ['GET', '/api/watches', 'List watches with query filters'],
          ['GET', '/api/watches/:slug', 'Single watch details (increments viewCount)'],
          ['POST', '/api/inquiries', 'Submit inquiry form (sends email)'],
          ['POST', '/api/auth', 'Admin login → returns Bearer token'],
          ['GET', '/api/sitemap.xml', 'XML sitemap for SEO'],
        ]
      ),
      spacer(),
      heading('Admin Endpoints (Authorization: Bearer <token>)', HeadingLevel.HEADING_3),
      makeTable(
        ['Method', 'Endpoint', 'Purpose'],
        [
          ['POST', '/api/watches/create', 'Create new watch listing'],
          ['PUT', '/api/watches/:slug', 'Update watch details'],
          ['DELETE', '/api/watches/:slug', 'Mark watch as SOLD'],
          ['GET', '/api/inquiries', 'List all customer inquiries'],
          ['PUT', '/api/inquiries/:id', 'Update inquiry status (NEW/CONTACTED/CLOSED)'],
          ['POST', '/api/upload-image', 'Upload watch images (multipart, max 10MB)'],
        ]
      ),

      spacer(),
      heading('GET /api/watches — Query Parameters', HeadingLevel.HEADING_3),
      makeTable(
        ['Parameter', 'Type', 'Example', 'Description'],
        [
          ['brand', 'string', 'Rolex', 'Filter by brand name'],
          ['category', 'string', 'Sport', 'Filter by category'],
          ['tier', 'string', 'A', 'Filter by tier (A/B/C)'],
          ['condition', 'string', 'excellent', 'Filter by condition'],
          ['minPrice', 'number', '100000', 'Minimum price in PHP'],
          ['maxPrice', 'number', '1000000', 'Maximum price in PHP'],
          ['search', 'string', 'Submariner', 'Search brand, model, name, reference'],
          ['status', 'string', 'AVAILABLE', 'AVAILABLE (default), SOLD, RESERVED, or ALL'],
          ['featured', 'boolean', 'true', 'Only featured watches'],
          ['sort', 'string', 'price_asc', 'price_asc, price_desc, popular, newest (default)'],
        ]
      ),

      // ═══ 6. DATA SHAPE ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('6. Watch Data Shape (inventory.json)'),
      para('Each watch in src/data/inventory.json has this structure:'),
      ...codeBlock([
        '{',
        '  "id": "watch-001",',
        '  "slug": "rolex-sea-dweller-116660",',
        '  "brand": "Rolex",',
        '  "model": "Sea-Dweller",',
        '  "reference": "116660",',
        '  "name": "Sea-Dweller Deepsea",',
        '  "price_php": 555000,',
        '  "condition": "excellent",         // excellent | good | fair | Brand New',
        '  "box": true,',
        '  "papers": true,',
        '  "tier": "A",                      // A | B | C',
        '  "availability": "in_stock",       // in_stock | incoming | reserved | sold',
        '  "category": "Sport",              // Sport | Dress | Classic | Vintage',
        '  "status": "AVAILABLE",            // AVAILABLE | SOLD | RESERVED',
        '  "featured": false,',
        '  "description": "44mm – 2011 Model...",',
        '  "images": ["/images/watches/filename.jpg"],',
        '  "video": { "type": "facebook", "url": "https://..." },',
        '  "specifications": {',
        '    "movement": "Caliber 3135 Automatic",',
        '    "caseMaterial": "Oystersteel 904L",',
        '    "diameter": "44mm",',
        '    "waterResistance": "3,900m / 12,800ft"',
        '  },',
        '  "viewCount": 0,',
        '  "inquiryCount": 0,',
        '  "marketTrend": "STABLE",          // STABLE | APPRECIATING | DECLINING',
        '  "annualAppreciation": 0,',
        '  "retailPricePHP": null,',
        '  "created_at": "2025-12-11T04:08:08.358Z",',
        '  "updated_at": "2025-12-11T04:22:39.309Z"',
        '}',
      ]),

      spacer(),
      heading('Inquiry Data Shape', HeadingLevel.HEADING_3),
      ...codeBlock([
        '{',
        '  "id": "uuid-string",',
        '  "name": "John Doe",',
        '  "email": "john@example.com",',
        '  "phone": "+63 912 345 6789",',
        '  "message": "Interested in this watch...",',
        '  "watchId": "watch-001",',
        '  "watch": { "id", "slug", "brand", "model", "reference", "pricePHP", "images" },',
        '  "source": "FORM",',
        '  "status": "NEW",                  // NEW | CONTACTED | CLOSED',
        '  "createdAt": "2025-12-11T04:08:08.358Z"',
        '}',
      ]),

      // ═══ 7. STATE MANAGEMENT ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('7. State Management (React Context)'),
      heading('WatchContext — useWatch()', HeadingLevel.HEADING_3),
      para('Global app state for watches, favorites, comparison, currency. All data persists to localStorage with "manila-watch-" prefix.'),
      spacer(),
      makeTable(
        ['Property / Method', 'Type', 'Description'],
        [
          ['favorites', 'string[]', 'Array of saved watch IDs'],
          ['comparison', 'string[]', 'Compare list (max 3 watches)'],
          ['recentlyViewed', 'string[]', 'Last 8 viewed watch IDs'],
          ['currency', 'string', 'Active currency code (PHP, USD, EUR, etc.)'],
          ['exchangeRates', 'object | null', 'Live rates from exchangerate-api.io'],
          ['addFavorite(id)', 'function', 'Add watch to favorites'],
          ['removeFavorite(id)', 'function', 'Remove from favorites'],
          ['isFavorite(id)', 'boolean', 'Check if watch is favorited'],
          ['addToComparison(id)', 'function', 'Add to compare (max 3)'],
          ['removeFromComparison(id)', 'function', 'Remove from compare'],
          ['clearComparison()', 'function', 'Clear all comparison watches'],
          ['addToRecentlyViewed(id)', 'function', 'Track viewed watch (max 8)'],
          ['setCurrency(code)', 'function', 'Switch currency'],
          ['convertPrice(phpAmount)', 'number', 'Convert PHP to active currency'],
          ['formatPrice(phpAmount)', 'string', 'Convert + format ("$10,200")'],
        ]
      ),

      spacer(),
      heading('AuthContext — useAuth()', HeadingLevel.HEADING_3),
      makeTable(
        ['Property / Method', 'Type', 'Description'],
        [
          ['user', 'object | null', '{ username, token } or null'],
          ['isAuthenticated', 'boolean', 'Whether admin is logged in'],
          ['login(username, password)', 'async', 'POST /api/auth → stores token'],
          ['logout()', 'function', 'Clears token from localStorage'],
        ]
      ),
      spacer(),
      para('Token stored in: localStorage.admin_token, admin_token_expires, admin_username'),

      // ═══ 8. AUTHENTICATION ═══
      spacer(),
      heading('8. Authentication Flow'),
      bullet('1. Admin visits /admin/login'),
      bullet('2. Submits username + password'),
      bullet('3. POST /api/auth → server SHA-256 hashes password + salt'),
      bullet('4. If match → returns { token: "64-char hex", expiresAt }'),
      bullet('5. Frontend stores token in localStorage'),
      bullet('6. All admin API calls include: Authorization: Bearer <token>'),
      bullet('7. Server verifies token is valid 64-char hex string'),
      spacer(),
      para('Generate password hash:'),
      ...codeBlock([
        'node -e "const c=require(\'crypto\');',
        '  console.log(c.createHash(\'sha256\')',
        '    .update(\'YOUR_PASSWORD\'+\'manila-watch-salt\')',
        '    .digest(\'hex\'))"',
      ]),

      // ═══ 9. ENVIRONMENT VARIABLES ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('9. Environment Variables'),
      makeTable(
        ['Variable', 'Required', 'Description'],
        [
          ['RESEND_API_KEY', 'For emails', 'Resend API key (re_xxx)'],
          ['ADMIN_EMAIL', 'For emails', 'Email address to receive inquiry notifications'],
          ['ADMIN_USERNAME', 'For auth', 'Admin login username (default: "admin")'],
          ['ADMIN_PASSWORD_HASH', 'For auth', 'SHA-256 hash of password + salt'],
          ['SALT', 'For auth', 'Password salt (default: "manila-watch-salt")'],
          ['APP_URL', 'Optional', 'Production URL (default: https://manilawatch.com)'],
          ['VITE_WHATSAPP_NUMBER', 'Optional', 'WhatsApp contact number'],
        ]
      ),

      // ═══ 10. STYLING GUIDE ═══
      spacer(),
      heading('10. Styling Guide'),
      heading('Brand Colors', HeadingLevel.HEADING_3),
      makeTable(
        ['Color', 'Hex', 'Tailwind Usage'],
        [
          ['Gold Accent', '#D4AF37', 'text-[#D4AF37]  border-[#D4AF37]  bg-[#D4AF37]'],
          ['Light Gold', '#F4E5B8', 'hover:bg-[#F4E5B8]'],
          ['Black BG', '#000000', 'bg-black'],
          ['Dark Surface', 'neutral-900', 'bg-neutral-900'],
          ['Border', 'neutral-800', 'border-neutral-800'],
          ['Body Text', 'white', 'text-white'],
          ['Muted Text', 'neutral-400', 'text-neutral-400'],
        ]
      ),
      spacer(),
      heading('Fonts', HeadingLevel.HEADING_3),
      bulletBold('Headings', 'font-serif → Playfair Display (Google Fonts)'),
      bulletBold('Body', 'default sans → Bai Jamjuree (Google Fonts)'),
      spacer(),
      heading('Common CSS Patterns', HeadingLevel.HEADING_3),
      ...codeBlock([
        '// Card',
        '"bg-neutral-900 border border-neutral-800 rounded-xl',
        '  hover:border-[#D4AF37] transition-all"',
        '',
        '// Gold button',
        '"bg-[#D4AF37] text-black font-semibold px-6 py-3 rounded-lg',
        '  hover:bg-[#F4E5B8]"',
        '',
        '// Outline button',
        '"border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded-lg',
        '  hover:bg-[#D4AF37] hover:text-black"',
        '',
        '// Glass effect',
        '"bg-black/80 backdrop-blur-lg border border-neutral-800"',
      ]),

      // ═══ 11. DATA FLOW ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('11. Data Flow'),
      heading('Watch Catalog (Read)', HeadingLevel.HEADING_3),
      ...codeBlock([
        'Component useEffect()',
        '  → fetch("/api/watches?status=AVAILABLE&sort=price_desc")',
        '  → dev-server.js (local) OR Vercel function (prod)',
        '  → Reads src/data/inventory.json',
        '  → Applies filters (brand, price, status, category, tier, search)',
        '  → Returns JSON array',
        '  → Component setState(watches)',
        '  → Renders ProductGrid → ProductCard[]',
      ]),
      spacer(),
      heading('Admin CRUD (Write)', HeadingLevel.HEADING_3),
      ...codeBlock([
        'AddWatchForm validates input',
        '  → POST /api/watches/create + Authorization header',
        '  → Server verifies Bearer token (64-char hex)',
        '  → Adds watch to inventory.json',
        '  → Returns created watch object',
        '  → Frontend updates state + shows toast',
      ]),
      spacer(),
      heading('Inquiry Submission', HeadingLevel.HEADING_3),
      ...codeBlock([
        'Customer fills InquiryModal',
        '  → POST /api/inquiries { name, email, phone, message, watchId }',
        '  → Server validates email format',
        '  → Creates inquiry with UUID + attaches watch metadata',
        '  → Saves to inquiries.json',
        '  → Triggers Resend email to ADMIN_EMAIL (non-blocking)',
        '  → Returns { success: true, id }',
        '  → Frontend shows success toast + closes modal',
      ]),
      spacer(),
      heading('Currency Conversion', HeadingLevel.HEADING_3),
      ...codeBlock([
        'WatchContext mounts',
        '  → detectUserCurrency() checks localStorage + browser locale',
        '  → Fetches rates from exchangerate-api.io',
        '  → Caches in localStorage (1 hour TTL)',
        '  → On currency change: price_php × rate = converted',
        '  → Components call formatPrice(priceInPHP) → "₱555,000" or "$10,200"',
      ]),

      // ═══ 12. CODE PATTERNS ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('12. Common Code Patterns'),
      heading('Fetching watches', HeadingLevel.HEADING_3),
      ...codeBlock([
        'useEffect(() => {',
        '  fetch("/api/watches?status=AVAILABLE&sort=price_desc")',
        '    .then(r => r.json())',
        '    .then(setWatches);',
        '}, []);',
      ]),
      spacer(),
      heading('Submitting an inquiry', HeadingLevel.HEADING_3),
      ...codeBlock([
        'fetch("/api/inquiries", {',
        '  method: "POST",',
        '  headers: { "Content-Type": "application/json" },',
        '  body: JSON.stringify({ name, email, phone, message, watchId })',
        '});',
      ]),
      spacer(),
      heading('Admin API call with auth', HeadingLevel.HEADING_3),
      ...codeBlock([
        'fetch(`/api/watches/${slug}`, {',
        '  method: "PUT",',
        '  headers: {',
        '    "Content-Type": "application/json",',
        '    "Authorization": `Bearer ${localStorage.getItem("admin_token")}`',
        '  },',
        '  body: JSON.stringify(updatedData)',
        '});',
      ]),
      spacer(),
      heading('Modal pattern (Framer Motion)', HeadingLevel.HEADING_3),
      ...codeBlock([
        'const [isOpen, setIsOpen] = useState(false);',
        '<>',
        '  <Button onClick={() => setIsOpen(true)}>Open</Button>',
        '  <AnimatePresence>',
        '    {isOpen && (',
        '      <motion.div',
        '        initial={{ opacity: 0 }}',
        '        animate={{ opacity: 1 }}',
        '        exit={{ opacity: 0 }}',
        '      >',
        '        {/* modal content */}',
        '      </motion.div>',
        '    )}',
        '  </AnimatePresence>',
        '</>',
      ]),
      spacer(),
      heading('Currency formatting', HeadingLevel.HEADING_3),
      ...codeBlock([
        'const { formatPrice } = useWatch();',
        '<span>{formatPrice(watch.price_php)}</span>',
        '// → "₱555,000" or "$10,200" depending on selected currency',
      ]),
      spacer(),
      heading('API base URL (auto-detects dev vs prod)', HeadingLevel.HEADING_3),
      ...codeBlock([
        'const API = import.meta.env.PROD',
        '  ? "/api"                         // Vercel serverless',
        '  : "http://localhost:3001/api";   // dev-server.js',
      ]),

      // ═══ 13. TWO BACKENDS ═══
      spacer(),
      heading('13. Two Backends: Dev vs Production'),
      makeTable(
        ['', 'Local Dev (dev-server.js)', 'Production (Vercel Serverless)'],
        [
          ['Server', 'Express on port 3001', 'Serverless functions in api/'],
          ['Data Source', 'src/data/inventory.json', 'src/data/inventory.json (bundled)'],
          ['Reads', 'Full read from JSON', 'Full read from JSON'],
          ['Writes', 'Persists to disk', 'Does NOT persist (read-only FS)'],
          ['File Uploads', 'Saves to public/images/', 'Vercel handles via upload-image.js'],
          ['Email', 'Resend (if API key set)', 'Resend (if API key set)'],
        ]
      ),
      spacer(),
      para('Note: For full write persistence in production, you would need to add a database (Vercel Postgres, Supabase, PlanetScale, etc.).'),

      // ═══ 14. DEPLOYMENT ═══
      new Paragraph({ children: [new PageBreak()] }),
      heading('14. Deployment'),
      heading('Git Branch Structure', HeadingLevel.HEADING_3),
      bulletBold('development', 'Working branch — all day-to-day commits'),
      bulletBold('master', 'Production branch — Vercel auto-deploys from here'),
      bulletBold('main', 'Snapshot branch (not production)'),
      spacer(),
      heading('Deploy Steps', HeadingLevel.HEADING_3),
      bullet('1. Push changes to development branch'),
      bullet('2. Create PR: development → master'),
      bullet('3. Merge PR on GitHub'),
      bullet('4. Vercel auto-deploys: npm install → npm run build → deploy'),
      bullet('5. Set environment variables in Vercel dashboard'),
      spacer(),
      heading('Vercel Config (vercel.json)', HeadingLevel.HEADING_3),
      ...codeBlock([
        '{',
        '  "buildCommand": "npm run build",',
        '  "outputDirectory": "build",',
        '  "functions": { "api/**/*.{js,ts}": { "memory": 1024, "maxDuration": 10 } },',
        '  "rewrites": [',
        '    { "source": "/api/(.*)", "destination": "/api/$1" },',
        '    { "source": "/(.*)", "destination": "/index.html" }',
        '  ]',
        '}',
      ]),

      // ═══ 15. PWA ═══
      spacer(),
      heading('15. PWA (Progressive Web App)'),
      bulletBold('manifest.json', 'App name "MWA", gold theme (#D4AF37), black bg, SVG icons'),
      bulletBold('sw.js', 'Service worker: cache-first for images, network-first for pages, skip /api/'),
      bulletBold('index.html', 'Registers service worker, sets theme-color meta, apple-mobile-web-app'),

      // ═══ 16. PERFORMANCE ═══
      spacer(),
      heading('16. Performance Optimizations'),
      bullet('Code Splitting — All pages lazy-loaded with React.lazy()'),
      bullet('Image Compression — vite-plugin-image-optimizer at 80% quality (~62% savings)'),
      bullet('Lazy Loading — loading="lazy" + decoding="async" on all product images'),
      bullet('Currency Cache — Exchange rates cached 1 hour in localStorage'),
      bullet('Service Worker — Caches static assets for offline/instant loads'),
      bullet('Minification — Vite handles JS/CSS minification in production'),

      // ═══ 17. CURRENCIES ═══
      spacer(),
      heading('17. Supported Currencies'),
      para('PHP, USD, EUR, GBP, JPY, CNY, KRW, SGD, HKD, AUD, CAD, CHF, THB, MYR, IDR, VND, INR, AED, SAR, NZD'),
      para('Auto-detects user locale on first visit. Rates from exchangerate-api.io, cached 1 hour.'),

      // ═══ 18. TESTING ═══
      spacer(),
      heading('18. Testing'),
      makeTable(
        ['Framework', 'Command', 'Location', 'Coverage'],
        [
          ['Vitest', 'npm run test', 'src/__tests__/', 'Currency conversion, utilities'],
          ['Playwright', 'npm run test:e2e', 'e2e/', 'Full user flows (catalog, search, inquiry)'],
        ]
      ),

      // ═══ FINAL ═══
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800 },
        children: [new TextRun({ text: 'MANILA WATCH ATELIER', bold: true, font: 'Segoe UI', size: 36, color: gold })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: 'Codebase Cheat Sheet', font: 'Segoe UI', size: 24, color: gray })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'End of Document', font: 'Segoe UI', size: 20, color: gray, italics: true })],
      }),

    ],
  }],
});

// ── Generate ─────────────────────────────────────────────────────────
const buffer = await Packer.toBuffer(doc);
const outPath = 'Manila-Watch-Atelier-Cheatsheet.docx';
fs.writeFileSync(outPath, buffer);
console.log(`✅ Generated: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
