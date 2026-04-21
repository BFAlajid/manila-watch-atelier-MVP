# Manila Watch Atelier -- Deployment & Launch Guide

**For:** Sherard W Ng, Manila Watch Atelier
**Stack:** React + Vite, Vercel Serverless, Claude AI Chatbot, Resend Email
**Target Domain:** manilawatch.com
**Last Updated:** March 2026

---

## Table of Contents

1. [Vercel Deployment -- Step by Step](#1-vercel-deployment)
2. [SEO for Luxury Watch Dealers](#2-seo-for-luxury-watch-dealers)
3. [Chatbot SEO & Conversion Optimization](#3-chatbot-seo--conversion-optimization)
4. [Going Live Checklist](#4-going-live-checklist)
5. [Cost Breakdown](#5-cost-breakdown)

---

## 1. Vercel Deployment

### 1.1 Deploy from GitHub (First Time)

**Prerequisites:** GitHub account with the `manila-watch-atelier-MVP` repository pushed. Vercel account (sign up at https://vercel.com using your GitHub login).

**Step-by-step:**

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. If prompted, click **"Install Vercel for GitHub"** and grant access to your repository
4. Select **`manila-watch-atelier-MVP`** from the list
5. Configure build settings (Vercel may auto-detect, but verify these match):

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |

6. Click **"Deploy"**
7. Wait 1-3 minutes. Your site will be live at `manila-watch-atelier-mvp.vercel.app`

**Important:** Your `vercel.json` is already configured correctly. It sets the output directory to `build`, configures security headers, and sets up SPA routing fallback. No changes needed.

### 1.2 Set Environment Variables

Go to: **Vercel Dashboard > Your Project > Settings > Environment Variables**

Add these variables for **all environments** (Production, Preview, Development):

| Variable | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Get from https://console.anthropic.com/settings/keys |
| `RESEND_API_KEY` | `re_...` | Get from https://resend.com/api-keys |
| `ADMIN_PASSWORD_HASH` | (your bcrypt hash) | For admin panel authentication |
| `APP_URL` | `https://manilawatch.com` | Used by sitemap generator |

**How to add each variable:**

1. In "Key" field, type the variable name (e.g., `ANTHROPIC_API_KEY`)
2. In "Value" field, paste the key
3. Check all three environment checkboxes: Production, Preview, Development
4. Click **"Save"**
5. **CRITICAL:** After adding all variables, redeploy. Go to **Deployments > click the three dots on the latest deployment > Redeploy**

**To get your Anthropic API key:**

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **Settings > API Keys**
4. Click **"Create Key"**
5. Name it `manila-watch-atelier`
6. Copy the key immediately (it will not be shown again)
7. Add billing at **Settings > Billing** (required for API usage)

**To get your Resend API key:**

1. Go to https://resend.com
2. Sign up
3. Go to **API Keys** in the sidebar
4. Click **"Create API Key"**
5. Name it `manila-watch-atelier`, permission: **Sending access**
6. Copy the key

### 1.3 Configure Custom Domain (manilawatch.com)

**Step 1: Add domain in Vercel**

1. Go to **Vercel Dashboard > Your Project > Settings > Domains**
2. Type `manilawatch.com` and click **"Add"**
3. Vercel will also suggest adding `www.manilawatch.com` -- add both
4. Choose which is primary (recommend: `manilawatch.com` with `www` redirecting to it)

**Step 2: Configure DNS at your registrar**

Vercel will show you the required DNS records. Set these at your domain registrar (Namecheap, GoDaddy, etc.):

For **apex domain** (manilawatch.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

For **www subdomain** (www.manilawatch.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Alternative (recommended): Use Vercel nameservers**

Instead of adding individual records, point your domain's nameservers to Vercel:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

This is done at your registrar under "Nameservers" or "DNS Management." This gives Vercel full DNS control and simplifies everything.

**Step 3: Wait for propagation**

- DNS changes take 5 minutes to 48 hours (usually under 1 hour)
- Check status at: https://dnschecker.org/#A/manilawatch.com
- Once propagated, Vercel automatically provisions a free SSL certificate

### 1.4 Serverless Function Considerations for Claude API

Your `api/chat.ts` is already configured well. Key details:

**Timeout configuration** (already in your `vercel.json`):
```json
"functions": {
  "api/chat.ts": {
    "memory": 1024,
    "maxDuration": 30
  }
}
```

**Plan-specific limits:**

| Plan | Max Duration | Cold Start Prevention |
|---|---|---|
| Hobby (Free) | 10 seconds | No |
| Pro ($20/mo) | 60 seconds (up to 800s with Fluid Compute) | Yes |

**IMPORTANT for your chatbot:** The Hobby plan's 10-second limit is TOO SHORT for Claude API calls with tool use. Your chat endpoint uses an agentic loop that can make multiple Claude API calls. You will almost certainly need the **Pro plan** for the chatbot to work reliably.

**Cold start mitigation:**
- Vercel Pro keeps at least one function instance warm in production (zero cold starts for 99.37% of requests)
- Your current non-streaming approach is fine for the agentic tool loop
- The 30-second `maxDuration` in your config is good -- most chat responses complete in 5-15 seconds

**Cost optimization tips for Claude API calls:**
- You already cap conversation history to last 20 messages (good)
- You already limit tool calls to 5 per request (good)
- Consider reducing `max_tokens` from 1024 to 512 for most responses -- luxury watch answers rarely need more
- Consider using `claude-haiku-4-20250514` for simple FAQ-type questions and reserving Sonnet for complex queries

### 1.5 Preview Deployments

Every time you push to a non-production branch (like `development`), Vercel automatically creates a preview deployment with a unique URL like:

```
manila-watch-atelier-mvp-git-development-your-username.vercel.app
```

**How to use this:**

1. Push changes to `development` branch
2. Check your Vercel dashboard -- a preview deployment appears automatically
3. Click the preview URL to test
4. When satisfied, merge `development` into `main`
5. Vercel automatically deploys the production version

**Tip:** Share preview URLs with testers before going live. Each pull request also gets its own preview URL.

### 1.6 Set Up Vercel Analytics

Your project already has `@vercel/analytics` in `package.json` but it is NOT wired up in the code. Here is what to do:

**Step 1: Add the Analytics component to `src/main.tsx`:**

```tsx
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
  </>
);
```

**Step 2: Enable in Vercel Dashboard:**

1. Go to **Your Project > Analytics**
2. Click **"Enable"**
3. Redeploy

**What you get:**
- Page views, unique visitors, top pages
- Referral sources
- Country/device breakdown
- Core Web Vitals monitoring
- No cookie banner required (privacy-friendly, no cookies used)

---

## 2. SEO for Luxury Watch Dealers

### 2.1 Schema.org Product Markup (Already Implemented)

Your `SEOHead.tsx` component already supports JSON-LD structured data, and `getWatchJsonLd()` generates proper Product schema. This is correctly implemented with:

- `@type: Product`
- Brand, name, description, image
- Offer with price, currency (PHP), availability, condition
- Seller organization

**Enhancements to add for richer results:**

```typescript
// In getWatchJsonLd() -- add these fields to the return object:
{
  // ... existing fields ...
  sku: watch.reference,
  mpn: watch.reference,
  gtin13: undefined, // Add if you have UPC/EAN codes
  category: 'Watches',
  material: watch.caseMaterial || undefined,
  weight: undefined, // Add if known, e.g. "155 g"
  additionalProperty: [
    {
      '@type': 'PropertyValue',
      name: 'Case Diameter',
      value: watch.caseDiameter || watch.specifications?.diameter,
    },
    {
      '@type': 'PropertyValue',
      name: 'Movement',
      value: watch.movement || watch.specifications?.movement,
    },
  ].filter(p => p.value),
}
```

**Test your structured data:**
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org
- Enter your watch detail page URLs once live

### 2.2 Open Graph & Twitter Cards (Already Implemented)

Your `SEOHead.tsx` already handles OG and Twitter meta tags. To maximize social sharing impact:

**Image requirements for optimal display:**
- Minimum: 1200x630 pixels
- Format: JPG or PNG
- Size: Under 5MB
- Show the watch prominently against a clean background

**Per-page OG images:**
- Each watch detail page should pass the watch's primary image as `ogImage`
- Verify this is happening in `WatchDetailPage.tsx`

**Test your social cards:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter/X: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 2.3 Sitemap & robots.txt

**Sitemap (Already Implemented):**

Your `api/sitemap.xml.ts` dynamically generates a sitemap with all watch pages, brand pages, and static pages. It will be available at:
```
https://manilawatch.com/api/sitemap.xml
```

**robots.txt (NEEDS TO BE CREATED):**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

# Block admin pages from search engines
Disallow: /admin
Disallow: /admin/*
Disallow: /api/

# Sitemap location
Sitemap: https://manilawatch.com/api/sitemap.xml
```

### 2.4 Google Search Console Setup

1. Go to https://search.google.com/search-console
2. Click **"Add Property"**
3. Choose **"URL prefix"** and enter `https://manilawatch.com`
4. Verify ownership using one of these methods:
   - **DNS verification (recommended if using Vercel nameservers):** Add a TXT record Vercel provides
   - **HTML tag:** Add the meta tag to `index.html` inside `<head>`
   - **HTML file:** Download the verification file, place it in `public/`
5. Once verified:
   - Go to **Sitemaps** in the sidebar
   - Enter `https://manilawatch.com/api/sitemap.xml`
   - Click **"Submit"**
6. Check back in 2-3 days for initial indexing data

### 2.5 Local SEO for Manila, Philippines

**Google Business Profile (critical for local discovery):**

1. Go to https://business.google.com
2. Click **"Add your business"**
3. Fill in:
   - Business name: **Manila Watch Atelier**
   - Category: **Watch store** (primary), **Watch repair service** (secondary if applicable)
   - Address: Your Manila business address (or "service area business" if operating from home)
   - Phone: Your business phone number
   - Website: `https://manilawatch.com`
   - Hours: Your operating hours
4. Verify via postcard, phone, or email (Google will provide options)
5. After verification:
   - Upload 10+ high-quality photos of your watches, showroom, and yourself
   - Write a description with keywords: "luxury watches Manila," "Rolex Philippines," "grey market watches Manila"
   - Add all services: Watch authentication, watch sourcing, watch appraisal
   - Post regularly (new arrivals, watch education content)
   - Request reviews from satisfied customers

**NAP Consistency (Name, Address, Phone):**

Ensure your business name, address, and phone number are IDENTICAL across:
- Google Business Profile
- Your website footer
- Facebook business page
- Instagram bio
- Any directory listings

**Local keywords to target:**
- "luxury watches Manila"
- "Rolex dealer Philippines"
- "pre-owned Patek Philippe Manila"
- "grey market watches Philippines"
- "authenticated luxury watches Manila"
- "Audemars Piguet Philippines price"

### 2.6 Image SEO

**Alt tags:** Ensure every watch image has descriptive alt text. Format:
```
"Rolex Submariner 126610LN - 41mm Black Dial Steel - Manila Watch Atelier"
```

**Image optimization:** Your Vite config already uses `vite-plugin-image-optimizer` with quality 80 for PNG, JPEG, and WebP. This is good.

**Image sitemap:** Consider adding image entries to your sitemap. In `api/sitemap.xml.ts`, you can enhance watch URLs:

```xml
<url>
  <loc>https://manilawatch.com/watch/rolex-submariner-126610ln</loc>
  <image:image>
    <image:loc>https://manilawatch.com/images/watches/rolex-sub.jpg</image:loc>
    <image:title>Rolex Submariner 126610LN</image:title>
  </image:image>
</url>
```

### 2.7 Core Web Vitals Optimization

Your app is already well-optimized with:
- Code splitting via lazy loading (all pages)
- Image optimization via Vite plugin
- Service worker for caching

**Additional optimizations:**

1. **Largest Contentful Paint (LCP):** Ensure hero section images use `loading="eager"` and are preloaded
2. **First Input Delay (FID):** Your code splitting helps. Minimize main bundle size
3. **Cumulative Layout Shift (CLS):** Set explicit width/height on all images to prevent layout shifts

**Measure with:**
- Lighthouse in Chrome DevTools (aim for 90+ on all scores)
- https://pagespeed.web.dev
- Vercel Analytics (after enabling, shows real user CWV data)

### 2.8 SPA Routing & SEO

Your app is a client-side SPA. Google can render JavaScript, but with a delay. Your current setup mitigates this:

- `react-helmet-async` updates meta tags per route (good)
- JSON-LD structured data is injected per page (good)
- Sitemap lists all important URLs (good)
- Vercel's SPA fallback rewrite ensures all routes serve `index.html` (good)

**If you need better SEO in the future**, consider:
- **Prerender.io** or **react-snap** for static HTML snapshots (medium effort)
- **Migrating to Next.js** for full SSR/SSG (large effort, significant improvement)

For now, your current setup is adequate for a luxury watch dealer. Google successfully renders most React SPAs within a few days of discovery.

---

## 3. Chatbot SEO & Conversion Optimization

### 3.1 Does the AI Chatbot Help SEO?

**Indirect benefits (yes):**
- **Increased dwell time:** Users spend more time on site chatting about watches, which is a positive engagement signal
- **Reduced bounce rate:** Visitors who engage with the chatbot are less likely to leave immediately
- **Internal linking:** The chatbot can recommend specific watch pages, driving deeper site exploration
- **Content freshness signals:** Active user engagement tells Google the site is valuable

**Direct benefits (no):**
- Chatbot conversations are not indexable by search engines (they happen via API calls)
- Google does not give SEO credit for having a chatbot

**Verdict:** The chatbot helps SEO indirectly through engagement metrics, but its primary value is conversion, not ranking.

### 3.2 Chatbot Conversion Optimization for Luxury Goods

Industry data shows ecommerce sites see a 15-30% conversion boost after implementing chatbots. For luxury goods specifically:

**Your chatbot is already well-configured for conversion.** It includes:
- Lead qualification (intent, budget, timeline assessment)
- Inventory search tools
- WhatsApp handoff links
- Inquiry creation for Sherard to follow up

**Enhancements to consider:**

1. **Proactive greeting timing:** Trigger the chatbot to open after 30 seconds on a watch detail page (not immediately -- luxury buyers want to browse first)

2. **Watch-specific context:** When the chatbot opens on a watch detail page, pre-load context like: "I see you are looking at the Rolex Submariner. Would you like to know more about this piece?"

3. **Scarcity signals:** Have the chatbot mention when a piece has had multiple inquiries: "This Tudor Black Bay has been popular this week -- would you like me to reserve a viewing?"

4. **Price anchoring:** When discussing grey market pricing, have the chatbot reference retail prices: "The retail price is PHP X, and our grey market price represents a Y% saving"

5. **Trust building:** Have the chatbot proactively mention the 3-month warranty and buy-back guarantee when sensing hesitation

### 3.3 Lead Capture Best Practices for High-Ticket Sales

**What is already working:**
- Your `create_inquiry` tool captures name, email, phone, and interest
- The chatbot frames contact collection as "VIP treatment"
- WhatsApp handoff is available for immediate connection

**Improvements:**

1. **Offer value in exchange for contact info:**
   - "I can have Sherard send you a detailed condition report with photos -- what is your email?"
   - "Want Sherard to check pricing flexibility on this piece? He can reach you on WhatsApp"

2. **Multi-touch capture:** If the user does not want to share info the first time, do not push. Circle back naturally later in the conversation

3. **Track chatbot metrics** (add to admin dashboard):
   - Total chat sessions per day
   - Chat-to-inquiry conversion rate
   - Most asked-about brands/models
   - Average messages before lead capture

---

## 4. Going Live Checklist

### Pre-Launch (Do These First)

- [ ] **Environment variables set** on Vercel (ANTHROPIC_API_KEY, RESEND_API_KEY, ADMIN_PASSWORD_HASH, APP_URL)
- [ ] **Test the chatbot** on a preview deployment -- send a few messages, verify tool calls work
- [ ] **Test inquiry form** -- submit a test inquiry, verify it appears in admin dashboard
- [ ] **Test admin login** -- verify you can log in to /admin/dashboard
- [ ] **Verify all watch images load** on preview deployment
- [ ] **Test on mobile** -- iPhone Safari and Android Chrome at minimum
- [ ] **Check all links** -- navigation, footer links, WhatsApp button, social links

### DNS & Domain

- [ ] **Domain registered** (manilawatch.com) -- purchase at Namecheap (~$10/yr) or GoDaddy
- [ ] **Domain added to Vercel** project (Settings > Domains)
- [ ] **DNS configured** -- A record to 76.76.21.21, CNAME www to cname.vercel-dns.com
- [ ] **SSL certificate active** -- Vercel provisions automatically after DNS propagation. Verify by visiting https://manilawatch.com -- should show padlock icon
- [ ] **www redirect working** -- www.manilawatch.com should redirect to manilawatch.com

### robots.txt

Create `public/robots.txt` with this content:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Sitemap: https://manilawatch.com/api/sitemap.xml
```

### Google Search Console

- [ ] **Property added** at https://search.google.com/search-console
- [ ] **Ownership verified** (DNS TXT record, HTML tag, or file upload)
- [ ] **Sitemap submitted** (`https://manilawatch.com/api/sitemap.xml`)
- [ ] **Request indexing** for homepage and key pages

### Analytics Setup

**Vercel Analytics (add to code):**
- [ ] Add `<Analytics />` component to `src/main.tsx` (see section 1.6)
- [ ] Enable Analytics in Vercel Dashboard

**Google Analytics (optional, for deeper insights):**
1. Go to https://analytics.google.com
2. Create a property for manilawatch.com
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)
4. Uncomment the GA snippet in `index.html` and replace `G-XXXXXXXXXX` with your ID

**Facebook Pixel (optional, for Facebook/Instagram ad retargeting):**
1. Go to https://business.facebook.com/events_manager
2. Create a pixel
3. Get your Pixel ID
4. Uncomment the Meta Pixel snippet in `index.html` and replace `PIXEL_ID`

### Social Media Meta Tags

- [ ] **Test homepage** with Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- [ ] **Test a watch page** with the same tool
- [ ] **Verify OG image** displays correctly (1200x630px minimum)
- [ ] **Test Twitter Card** at https://cards-dev.twitter.com/validator

### Performance

- [ ] **Run Lighthouse** on homepage (Chrome DevTools > Lighthouse tab)
  - Target: 90+ Performance, 90+ Accessibility, 90+ Best Practices, 90+ SEO
- [ ] **Run PageSpeed Insights**: https://pagespeed.web.dev/?url=https://manilawatch.com
- [ ] **Test on slow connection** -- Chrome DevTools > Network > Throttle to "Slow 3G"

### Mobile Responsiveness

- [ ] **Test on real devices** if possible (iPhone, Android phone, iPad)
- [ ] **Chrome DevTools device emulation** -- test iPhone SE (smallest), iPhone 14 Pro, iPad, Galaxy S series
- [ ] **Verify touch targets** are at least 44x44px (buttons, links)
- [ ] **Verify chatbot works on mobile** -- opens, scrolls, sends messages

### Final Smoke Test

- [ ] Visit https://manilawatch.com -- homepage loads correctly
- [ ] Navigate to /inventory -- watches display
- [ ] Click a watch -- detail page loads with correct info
- [ ] Open chatbot -- send "Hi, I'm looking for a Rolex" -- verify response
- [ ] Submit an inquiry -- verify it works
- [ ] Click WhatsApp button -- correct phone number and message
- [ ] Check /admin/login -- can log in
- [ ] Check /api/sitemap.xml -- valid XML with all pages listed

---

## 5. Cost Breakdown

### 5.1 Vercel Hosting

| | Hobby (Free) | Pro ($20/mo) |
|---|---|---|
| Price | $0 | $20/month |
| Bandwidth | 100 GB/mo | 1 TB/mo |
| Serverless Function Timeout | 10 sec | 60 sec (800s with Fluid) |
| Cold Start Prevention | No | Yes |
| Analytics | Basic | Advanced |
| Preview Deployments | Yes | Yes |
| Custom Domain | Yes | Yes |
| SSL | Yes (auto) | Yes (auto) |
| Commercial Use | NO (violates TOS) | Yes |

**Recommendation: Pro plan ($20/month) is REQUIRED.**

Reasons:
1. Hobby plan prohibits commercial use -- your watch business is commercial
2. Hobby's 10-second function timeout will cause chatbot failures
3. Pro plan's cold start prevention ensures the chatbot responds quickly
4. Pro includes better analytics

### 5.2 Claude API (Anthropic) -- Chatbot Costs

**Current model in code:** `claude-sonnet-4-20250514`

**Pricing (as of March 2026):**

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| Claude Sonnet 4 | $3.00 | $15.00 |
| Claude Haiku 4 | $0.80 | $4.00 |

**Estimated monthly cost at 50-100 chats/day:**

Assumptions per chat session:
- System prompt: ~2,000 tokens (input, sent every request)
- Average 5 user messages per session: ~500 tokens input
- Average 5 assistant responses per session: ~750 tokens output
- Tool calls (1-2 per session): ~300 tokens input, ~200 tokens output
- Total per session: ~2,800 input tokens, ~950 output tokens

| Volume | Sonnet 4 Cost/mo | Haiku 4 Cost/mo |
|---|---|---|
| 50 chats/day (1,500/mo) | ~$28 | ~$7 |
| 100 chats/day (3,000/mo) | ~$56 | ~$14 |
| 200 chats/day (6,000/mo) | ~$112 | ~$28 |

**Cost-saving strategies:**
1. **Use Haiku for simple queries:** Route "What are your hours?" type questions to Haiku, use Sonnet only for complex watch discussions. Saves 70%+
2. **Prompt caching:** Anthropic offers prompt caching that saves 90% on repeated system prompts. Your system prompt (with inventory) is sent on every request -- caching it would significantly reduce input token costs
3. **Reduce max_tokens:** Change from 1024 to 512 in most cases
4. **Aggressive conversation trimming:** You already limit to 20 messages, which is good

**Setting a spending limit:**
1. Go to https://console.anthropic.com/settings/limits
2. Set a monthly spending limit (suggest $100/month to start)
3. You will get email warnings at 50% and 80% of limit

### 5.3 Resend Email

| Plan | Price | Emails/Month | Domains |
|---|---|---|---|
| Free | $0 | 3,000 (100/day) | 1 |
| Pro | $20/mo | 50,000 | Unlimited |

**Recommendation: Start with Free tier.**

At 50-100 inquiries per day (best case), the free tier's 100/day limit covers you. Upgrade to Pro only if you add newsletter functionality or automated email sequences.

**Setup your sending domain:**
1. Go to https://resend.com/domains
2. Add `manilawatch.com`
3. Add the DNS records Resend provides (SPF, DKIM, DMARC)
4. This ensures emails come from `noreply@manilawatch.com` instead of Resend's domain

### 5.4 Domain Registration

| Registrar | .com Price/Year | .com.ph Price/Year |
|---|---|---|
| Namecheap | ~$10-13 USD | ~$35-40 USD |
| GoDaddy PH | ~$12-20 USD | ~$40-50 USD |
| Porkbun | ~$10 USD | N/A |
| DotPH (for .ph) | N/A | ~PHP 1,500/yr |

**Recommendation:** Register `manilawatch.com` on Namecheap ($10-13/year). If you also want `manilawatch.com.ph`, register it on DotPH for local credibility.

**Important:** Enable auto-renewal and WHOIS privacy protection on your domain.

### 5.5 Total Monthly Cost Summary

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Claude API (Sonnet, ~75 chats/day) | ~$40 |
| Resend | $0 (free tier) |
| Domain (amortized) | ~$1 |
| **Total** | **~$61/month** |

**With cost optimization (Haiku for simple queries + prompt caching):**

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Claude API (optimized) | ~$15 |
| Resend | $0 |
| Domain | ~$1 |
| **Total** | **~$36/month** |

This is extremely reasonable for a luxury watch business where a single sale generates PHP 100,000+ in revenue.

---

## Quick-Start: Minimum Steps to Go Live

If you want the fastest path to launch, here is the absolute minimum:

1. **Push code to GitHub** `main` branch
2. **Sign up at vercel.com** with GitHub
3. **Import the repo** and deploy
4. **Add environment variables** (ANTHROPIC_API_KEY, RESEND_API_KEY, APP_URL)
5. **Redeploy** after adding env vars
6. **Register manilawatch.com** on Namecheap
7. **Add domain in Vercel** and configure DNS
8. **Wait for DNS propagation** (5 min to 1 hour)
9. **Test everything** on the live domain
10. **Submit sitemap** to Google Search Console

You can handle SEO optimization, analytics, and Google Business Profile setup in the days following launch. Getting live is the priority.

---

## Sources

### Vercel Deployment
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Adding & Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Setting Up a Custom Domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel Function Timeouts](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- [Scale to One: How Fluid Solves Cold Starts](https://vercel.com/blog/scale-to-one-how-fluid-solves-cold-starts)
- [Improving Cold Start Performance](https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel)
- [Getting Started with Vercel Web Analytics](https://vercel.com/docs/analytics/quickstart)
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Pro Plan](https://vercel.com/docs/plans/pro-plan)
- [Vercel Limits](https://vercel.com/docs/limits)

### SEO & Structured Data
- [Product Schema for Ecommerce SEO](https://www.seoclarity.net/blog/product-schema-seo)
- [Schema Markup Tips for Ecommerce 2025](https://1seo.com/blog/schema-markup-tips-for-better-ecommerce-visibility-in-2025/)
- [Schema Markup: The Complete Guide 2026](https://www.wearetg.com/blog/schema-markup/)
- [SEO Optimization for React + Vite Apps](https://dev.to/ali_dz/optimizing-seo-in-a-react-vite-project-the-ultimate-guide-3mbh)
- [How to Make a React Website SEO-Friendly in 2025](https://www.creolestudios.com/how-to-make-react-website-seo-friendly/)
- [SPA SEO: Optimizing Single-Page Apps](https://www.wedowebapps.com/spa-seo-optimize-single-page-applications/)
- [Build and Submit a Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Open Graph and Twitter Card Meta Tags](https://www.digitalocean.com/community/tutorials/how-to-add-twitter-card-and-open-graph-social-metadata-to-your-webpage-with-html)

### Local SEO Philippines
- [Local SEO Guide for Businesses in the Philippines 2025](https://sharprocket.com.ph/local-seo-guide-philippines/)
- [Local SEO Strategies for Filipino Businesses](https://wizworxx.com/local-seo-strategies-to-help-filipino-businesses-rank-higher-on-google/)

### Chatbot & Conversion
- [AI Chatbots for Ecommerce: Conversion Optimization](https://www.makebot.ai/blog-en/ai-chatbot-ecommerce-conversion-optimization)
- [13 AI Chatbots for Ecommerce 2025](https://seo.ai/blog/ai-chatbots-for-ecommerce)
- [Ecommerce Conversion Rate Statistics 2026](https://www.envive.ai/post/ecommerce-conversion-rate-statistics)

### Pricing
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude API Pricing 2026 Breakdown](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration)
- [Resend Pricing](https://resend.com/pricing)
- [Resend Pricing Guide 2025](https://flexprice.io/blog/detailed-resend-pricing-guide)
- [Domain Name Cost: Pricing Breakdown 2026 (Shopify PH)](https://www.shopify.com/ph/blog/domain-price)
