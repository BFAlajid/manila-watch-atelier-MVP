# Manila Watch Atelier

Showcase and lead-generation platform for Manila Watch Atelier, a trusted grey market luxury watch dealer based in Manila, Philippines, operated by Sherard W Ng.

The site displays authenticated inventory with full specifications, handles buyer inquiries via form and WhatsApp, and provides market insights — all designed to build trust and drive conversion. There is no online checkout; all negotiation and payment happens personally through Sherard.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Express dev server (local), Vercel Serverless Functions (production)
- **Data:** JSON files (`src/data/inventory.json`, `src/data/inquiries.json`)
- **Email:** Resend (inquiry notifications)
- **Charts:** Recharts (Market Insights page)
- **SEO:** react-helmet-async, JSON-LD structured data, dynamic sitemap

## Features

- **Inventory showcase** with filtering by brand, price range, condition, and search
- **Watch detail pages** with image gallery, video player, specifications, and lightbox
- **Inquiry system** — form submissions stored as JSON, email notifications to admin, rate limiting (3 per email per hour)
- **WhatsApp integration** — pre-filled messages linking to specific watches
- **Admin dashboard** — watch CRUD, status management (Available/Reserved/Sold), inquiry tracking with status pipeline (New/Contacted/Closed)
- **Market Insights** (`/insights`) — interactive charts showing brand price distributions, market trends, grey market premiums, and dealer commentary
- **Brand landing pages** (`/watches/:brand`) — SEO-optimized pages targeting "[brand] watches Philippines" searches
- **SEO** — dynamic meta tags, Open Graph, JSON-LD Product schema, XML sitemap
- **Multi-currency** display (PHP, USD, EUR, SGD, HKD, and more)
- **Favorites, comparison, recently viewed** — client-side localStorage features
- **Dark theme** with gold (#D4AF37) accent throughout

## Setup

### Prerequisites
- Node.js 18+

### Environment Variables

Copy `.env` and fill in your values:

```
RESEND_API_KEY="re_..."
APP_URL="http://localhost:3000"
ADMIN_EMAIL="sherard@manilawatch.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="your_sha256_hash"
SALT="manila-watch-salt"
```

Generate the admin password hash:
```bash
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD'+'manila-watch-salt').digest('hex'))"
```

### Install & Run

```bash
npm install

# Development (frontend + API concurrently)
npm run dev

# Or run separately
npm run dev:frontend   # Vite frontend (port 3000)
npm run dev:api        # Express API (port 3001)

# Production build
npm run build
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + API dev servers concurrently |
| `npm run dev:frontend` | Start Vite dev server only |
| `npm run dev:api` | Start local API server only |
| `npm run build` | Vite production build |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/watches` | Public | List watches with filters |
| GET | `/api/watches/:slug` | Public | Single watch + view count increment |
| POST | `/api/watches/create` | Admin | Create new watch (zod-validated) |
| PUT | `/api/watches/:slug` | Admin | Update watch (zod-validated) |
| DELETE | `/api/watches/:slug` | Admin | Mark watch as sold |
| POST | `/api/inquiries` | Public | Submit inquiry (rate-limited, zod-validated) |
| GET | `/api/inquiries` | Admin | List all inquiries |
| PUT | `/api/inquiries/:id` | Admin | Update inquiry status |
| POST | `/api/auth` | Public | Admin login (returns HMAC-signed token) |
| GET | `/api/sitemap.xml` | Public | Dynamic XML sitemap |

## Authentication

Admin authentication uses HMAC-signed tokens. On login, the server verifies the SHA-256 password hash and returns a signed token containing the username and expiry. All admin endpoints verify the token signature and expiration server-side — no session store needed.

## Deployment

Deploys to Vercel. The `api/` directory contains serverless functions, and `build/` is served as static assets. Ensure all environment variables are set in Vercel project settings.

**Note:** The JSON-file data layer is read-only on Vercel (serverless functions have a read-only filesystem). Write operations (create/update/delete watches, save inquiries) work locally but will not persist in production. For full persistence, migrate to a database (Neon, Supabase, or Vercel KV).
