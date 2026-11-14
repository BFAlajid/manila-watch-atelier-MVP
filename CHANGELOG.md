# Changelog

## [1.0.0] - Unreleased

First production release. Summarises `main..development` (39 commits).

### Added
- Claude concierge chatbot with SSE streaming, ephemeral prompt caching, scope guardrails and Vercel Hobby timeout tuning.
- Durable persistence on Vercel KV / Upstash Redis (keys namespaced `mwa:`), with a JSON-file fallback for local development.
- Admin CRM: server-persisted notes, quick actions, bulk actions, sonner toasts, optimistic updates that revert on failure, and a FOLLOW_UP status.
- Admin CSV import for watches, round-trippable with Export.
- Shared UI primitives (Modal, Field, IconButton, Alert, Button).
- Live currency rates API, `/api/health`, and a GitHub Actions workflow (typecheck, tests, build, npm audit).
- Image pipeline: sharp prebuild producing avif/webp siblings, Tailwind JIT via `@tailwindcss/vite`.

### Security
- Non-public watch statuses (`RESERVED`, `ARCHIVED`, `ALL`) now require a valid Bearer token on `GET /api/watches`; only `AVAILABLE` and `SOLD` are public.
- Enforced CSP, security headers, inquiry honeypot, audit log, anti-scrape measures, scrypt password hashing and `TOKEN_SECRET`.
- Token TTL, CSV-injection protection, `/images` nosniff, WhatsApp number moved to env.

### Changed
- Shared API handlers extracted so the dev server and Vercel functions no longer drift.
- Frontend reads `/api/watches` instead of static JSON; watch lists use a short cache with revalidate-on-focus so admin changes propagate within seconds.
- Mark-as-sold uses PUT instead of DELETE.
- Prisma backend replaced by the JSON/KV data layer; unused code and dependencies pruned; `motion` and `react-router-dom` pinned to explicit ranges.

### Fixed
- Bulk status change in the admin dashboard now updates only the watches whose save succeeded; failed ones keep their old status, stay selected and are reported.
- SPA fallback no longer swallows `/api/*` and static paths; localStorage key collision between currency systems; `dark` class restored on `<html>`; CSV export empty-default.

### Tests
- Added unit tests for bulk-result handling and for the watches and inquiries API handlers.
