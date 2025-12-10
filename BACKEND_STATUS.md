# Backend Implementation Status

## ✅ Completed

### 1. Infrastructure Setup
- [x] Prisma schema with complete database models
- [x] Next.js configuration
- [x] Environment variable template (`.env.example`)
- [x] Prisma client singleton (`lib/prisma.ts`)
- [x] Stripe client configuration (`lib/stripe.ts`)
- [x] Email service with Resend (`lib/email.ts`)
- [x] Authentication utilities (`lib/auth.ts`)
- [x] Helper functions (`lib/utils.ts`)

### 2. Database Models Created
- **Customer**: Email, name, phone, orders
- **Order**: Complete order tracking with payment and fulfillment
- **AdminUser**: Secure admin authentication
- **Enums**: PaymentMethod, PaymentStatus, FulfillmentType, OrderStatus

### 3. Email Templates
- Order confirmation (card payment)
- Order confirmation (bank transfer)
- Admin payment verification notification
- Payment approved notification
- Payment rejected notification

---

## 📋 To-Do: Core Implementation

### Phase 1: API Routes (CRITICAL)

#### Checkout APIs
```
app/api/checkout/
├── create-order/route.ts          # ⏳ Create order for both payment types
├── stripe-intent/route.ts         # ⏳ Create Stripe PaymentIntent
└── upload-proof/route.ts          # ⏳ Upload bank transfer screenshot
```

#### Stripe Webhook
```
app/api/stripe/
└── webhook/route.ts               # ⏳ Handle payment confirmations
```

#### Admin APIs
```
app/api/admin/
├── orders/route.ts                # ⏳ List all orders
├── orders/[id]/route.ts           # ⏳ Get/update single order
├── verify-payment/route.ts        # ⏳ Approve/reject bank transfer
└── stats/route.ts                 # ⏳ Dashboard statistics
```

### Phase 2: Frontend Components (CRITICAL)

#### Checkout Flow
```
app/checkout/
└── page.tsx                       # ⏳ Complete checkout page

components/checkout/
├── PaymentMethodSelector.tsx      # ⏳ Card vs Bank Transfer choice
├── StripeCardForm.tsx             # ⏳ Stripe Elements integration
├── BankTransferForm.tsx           # ⏳ Bank details + proof upload
├── ShippingForm.tsx               # ⏳ Shipping address input
├── PickupForm.tsx                 # ⏳ Pickup date/time selection
└── OrderSummary.tsx               # ⏳ Review before payment
```

#### Order Confirmation
```
app/order-confirmation/
└── [id]/page.tsx                  # ⏳ Success page after checkout
```

#### Admin Dashboard
```
app/admin/
├── layout.tsx                     # ⏳ Admin-only layout with auth
├── page.tsx                       # ⏳ Dashboard with stats
├── orders/page.tsx                # ⏳ Orders management
├── orders/[id]/page.tsx           # ⏳ Single order detail
└── login/page.tsx                 # ⏳ Admin login

components/admin/
├── OrdersTable.tsx                # ⏳ Sortable orders table
├── OrderDetailModal.tsx           # ⏳ View order details
├── PaymentVerificationModal.tsx   # ⏳ Approve/reject payments
├── StatsCards.tsx                 # ⏳ Dashboard statistics
└── OrderStatusBadge.tsx           # ⏳ Visual status indicators
```

### Phase 3: File Upload Integration
```
app/api/uploadthing/
└── core.ts                        # ⏳ Uploadthing configuration

lib/uploadthing.ts                 # ⏳ Upload utilities
```

### Phase 4: Next.js App Structure
```
app/
├── layout.tsx                     # ⏳ Root layout (providers, fonts)
├── page.tsx                       # ⏳ Homepage (existing content)
├── inventory/page.tsx             # ⏳ Migrate from Vite
├── watch/[slug]/page.tsx          # ⏳ Migrate watch detail pages
└── globals.css                    # ⏳ Migrate styles
```

---

## 🎯 Implementation Priority

### Tier 1: Must-Have for MVP (3-4 days)
1. **Create Order API** - Save orders to database
2. **Stripe Payment Integration** - Card payment processing
3. **Bank Transfer Flow** - Upload proof, notify admin
4. **Admin Dashboard** - View & approve orders
5. **Payment Verification API** - Approve/reject bank transfers
6. **Basic Email Notifications** - Order confirmations

### Tier 2: Polish & UX (1-2 days)
7. **Order Confirmation Page** - Show success message
8. **Admin Order Management** - Update status, add notes
9. **Customer Order Lookup** - View order by email
10. **Enhanced Email Templates** - Better formatting

### Tier 3: Production Ready (1 day)
11. **Error Handling** - Graceful failures
12. **Loading States** - Better UX during API calls
13. **Form Validation** - Prevent bad data
14. **Security Audit** - Rate limiting, input sanitization

---

## 📦 Dependencies Installed

```json
{
  "next": "latest",
  "prisma": "latest",
  "@prisma/client": "latest",
  "stripe": "latest",
  "@stripe/stripe-js": "latest",
  "@stripe/react-stripe-js": "latest",
  "uploadthing": "latest",
  "@uploadthing/react": "latest",
  "resend": "latest",
  "bcryptjs": "latest",
  "zod": "latest"
}
```

---

## 🚀 Next Steps

### Immediate (Do First)
1. Set up local PostgreSQL database OR use Vercel Postgres
2. Create `.env` file from `.env.example`
3. Run `npx prisma migrate dev --name init`
4. Run `npx prisma generate`
5. Start implementing API routes

### After APIs Work
6. Build checkout UI components
7. Test end-to-end order flow
8. Build admin dashboard
9. Test payment verification

### Before Deployment
10. Set up production database
11. Configure Stripe webhook in production
12. Set up Uploadthing account
13. Set up Resend account
14. Deploy to Vercel

---

## 💡 Deployment Options

### Option A: Vercel (Recommended)
- **Frontend**: Free hosting
- **Database**: Vercel Postgres ($0.25/month hobby tier)
- **Functions**: 100GB-hours/month free
- **Total Cost**: ~₱15-50/month

### Option B: Railway
- **All-in-one**: $5/month
- **PostgreSQL included**
- **Easier setup**

### Option C: Self-hosted (if you have VPS)
- **Node.js server**
- **PostgreSQL**
- **Nginx reverse proxy**
- **Cost**: VPS rental only

---

## 📝 Configuration Needed Before Launch

### Stripe
1. Create Stripe account (test mode first)
2. Get API keys (secret + publishable)
3. Configure webhook endpoint
4. Enable payment methods (card, bank transfer future)

### Uploadthing
1. Create account at uploadthing.com
2. Get API keys
3. Configure file size limits (5MB for screenshots)

### Resend
1. Create account at resend.com
2. Verify domain (manilawatch.com or use resend.dev)
3. Get API key
4. Configure "From" email address

### Database
1. Set up PostgreSQL (local or cloud)
2. Get connection string
3. Run migrations
4. Seed with default admin user

---

## 🎯 Success Criteria

Before considering backend "complete":

- [ ] Customer can checkout with Stripe card
- [ ] Customer can checkout with bank transfer
- [ ] Bank transfer proof uploads successfully
- [ ] Admin receives email notification
- [ ] Admin can view orders in dashboard
- [ ] Admin can approve/reject bank transfers
- [ ] Customer receives confirmation emails
- [ ] Shipping vs Pickup selection works
- [ ] Order statuses update correctly
- [ ] No security vulnerabilities (input validation, auth)

---

**Current Status**: Infrastructure ready, APIs need implementation
**Estimated Time to MVP**: 3-4 days
**Next Action**: Implement checkout and payment APIs
