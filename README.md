# Manila Watch Atelier

Showcase and lead-generation platform for Manila Watch Atelier, a trusted grey market luxury watch dealer based in Manila, Philippines, operated by Sherard W Ng.

The site displays authenticated inventory with full specifications, handles buyer inquiries via form and WhatsApp, and provides market insights — all designed to build trust and drive conversion. There is no online checkout; all negotiation and payment happens personally through Sherard.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix/shadcn
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** PostgreSQL via Prisma ORM
- **Email:** Resend (inquiry notifications)
- **Charts:** Recharts (Market Insights page)
- **SEO:** react-helmet-async, JSON-LD structured data, dynamic sitemap

## Features

- **Inventory showcase** with filtering by brand, price range, condition, and search
- **Watch detail pages** with image gallery, video player, specifications, and psychology-driven conversion elements (FOMO, scarcity, urgency, social proof)
- **Inquiry system** — form submissions stored in database, email notifications to admin, rate limiting
- **WhatsApp integration** — pre-filled messages linking to specific watches
- **Admin dashboard** — watch CRUD, status management (Available/Reserved/Sold), inquiry tracking with status pipeline (New/Contacted/Closed)
- **Market Insights** (`/insights`) — interactive charts showing brand price distributions, market trends, grey market premiums, and dealer commentary
- **Brand landing pages** (`/watches/:brand`) — SEO-optimized pages targeting "[brand] watches Philippines" searches
- **SEO** — dynamic meta tags, Open Graph, JSON-LD Product schema, XML sitemap
- **Multi-currency** display (PHP, USD, EUR, SGD, HKD)
- **Favorites, comparison, recently viewed** — client-side localStorage features
- **Dark theme** with gold (#D4AF37) accent throughout

## Data Model

### Watch
Tracks inventory with full horological details: brand, model, reference, condition, specifications (movement, case material, diameter, water resistance, etc.), pricing (grey market + retail for premium calculations), market trend data, images, video, and availability tier (A = in stock, B = incoming, C = on demand).

### Inquiry
Stores customer inquiries linked to specific watches. Tracks status through a pipeline: NEW → CONTACTED → CLOSED. Rate-limited to 3 per email per hour.

### AdminUser
Single admin account for dashboard access. Authentication uses SHA-256 hashed passwords via Vercel serverless.

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Neon, Supabase)

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL="postgresql://user:password@localhost:5432/manila_watch_atelier"
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
npx prisma migrate dev      # Create database tables
npx tsx scripts/seed-watches.ts  # Seed 23 watches

# Development
npm run dev          # Vite frontend (port 5173)
npm run dev:api      # Express API proxy (port 3001)

# Production build
npm run build
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:api` | Start local API server |
| `npm run build` | Generate Prisma client + Vite build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed watches into database |
| `npm run db:migrate-json` | Migrate old JSON inventory to database |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/watches` | Public | List watches with filters |
| GET | `/api/watches/:slug` | Public | Single watch + view count increment |
| POST | `/api/watches/create` | Admin | Create new watch |
| PUT | `/api/watches/:slug` | Admin | Update watch |
| DELETE | `/api/watches/:slug` | Admin | Mark watch as sold |
| POST | `/api/inquiries` | Public | Submit inquiry (rate-limited) |
| GET | `/api/inquiries` | Admin | List all inquiries |
| PUT | `/api/inquiries/:id` | Admin | Update inquiry status |
| POST | `/api/auth` | Public | Admin login |
| GET | `/api/sitemap.xml` | Public | Dynamic XML sitemap |

## Deployment

Deploys to Vercel. The `api/` directory contains serverless functions, and `build/` is served as static assets. Ensure all environment variables are set in Vercel project settings.
