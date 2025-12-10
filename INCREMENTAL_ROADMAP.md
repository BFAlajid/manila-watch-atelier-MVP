# 🗺️ Incremental Implementation Roadmap

## Current Status: Demo Ready ✅

**What's Live:**
- Complete frontend (36 watches, currency conversion, psychological UX)
- Admin dashboard (view-only)
- All UI features working

**What's Prepared:**
- Database schema (Prisma)
- Email templates (Resend)
- Stripe configuration
- Authentication system
- Helper utilities

**What's Missing:**
- API routes (payment, orders)
- Checkout flow
- Admin order management
- File uploads

---

## Phase 1: Card Payments (Week 1)

### Goal: Allow customers to pay with credit/debit cards via Stripe

### Step 1.1: Set Up Database (Day 1)
**Tasks:**
- [ ] Create Vercel Postgres database
- [ ] Get database connection URL
- [ ] Add to .env file
- [ ] Run `npx prisma migrate dev`
- [ ] Test database connection

**Files to create:**
```
.env (with DATABASE_URL)
```

**Test:**
```bash
npx prisma studio  # Opens database viewer
```

---

### Step 1.2: Create Stripe Account (Day 1)
**Tasks:**
- [ ] Sign up at stripe.com
- [ ] Get test API keys
- [ ] Add to .env file
- [ ] Test connection

**Environment Variables:**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Test:**
```bash
# We'll create a test API route to verify
```

---

### Step 1.3: Build Create Order API (Day 1-2)
**File:** `app/api/checkout/create-order/route.ts`

**What it does:**
1. Accepts order data (watch, customer info, fulfillment type)
2. Creates customer in database (or finds existing)
3. Creates order record
4. Generates order number (MWA-2025-0001)
5. Returns order ID

**Input:**
```json
{
  "watchId": "watch-001",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+63912345678",
  "fulfillmentType": "SHIPPING",
  "shippingAddress": "123 Main St, Manila",
  "pricePhp": 850000,
  "displayCurrency": "USD",
  "displayTotal": 15500,
  "exchangeRate": 54.8387
}
```

**Output:**
```json
{
  "orderId": "clx123...",
  "orderNumber": "MWA-2025-0001"
}
```

**Testing:**
- Test with Postman or curl
- Verify order appears in database
- Check order number increments

---

### Step 1.4: Build Stripe Payment Intent API (Day 2)
**File:** `app/api/checkout/stripe-intent/route.ts`

**What it does:**
1. Accepts order ID and amount
2. Creates Stripe PaymentIntent
3. Returns client secret for frontend

**Input:**
```json
{
  "orderId": "clx123...",
  "amount": 850000,
  "currency": "php"
}
```

**Output:**
```json
{
  "clientSecret": "pi_123_secret_456"
}
```

**Testing:**
- Create payment intent
- Verify in Stripe dashboard
- Test with test card: 4242 4242 4242 4242

---

### Step 1.5: Build Stripe Webhook (Day 2-3)
**File:** `app/api/stripe/webhook/route.ts`

**What it does:**
1. Listens for Stripe payment confirmations
2. Verifies webhook signature
3. Updates order status to PAYMENT_VERIFIED
4. Sends confirmation email

**Testing:**
- Use Stripe CLI to test webhooks locally
- Complete test payment
- Verify order status updates
- Check email sent

---

### Step 1.6: Build Checkout Page (Day 3-4)
**File:** `app/checkout/page.tsx`

**Components:**
- Checkout form (shipping address)
- Stripe Elements (card input)
- Order summary
- Submit button

**Flow:**
1. User fills shipping form
2. Clicks "Proceed to Payment"
3. Enters card details
4. Clicks "Pay ₱850,000"
5. Payment processes
6. Redirects to confirmation page

**Testing:**
- Fill form and submit
- Test Stripe card form
- Complete full payment
- Verify order created

---

### Step 1.7: Build Order Confirmation Page (Day 4)
**File:** `app/order-confirmation/[id]/page.tsx`

**What it shows:**
- Order number
- Watch details
- Payment status
- Shipping/pickup info
- Next steps

**Testing:**
- View after successful payment
- Check all details display
- Test email receipt

---

### ✅ Phase 1 Complete Checklist

- [ ] Database connected and working
- [ ] Stripe test mode configured
- [ ] Create order API working
- [ ] Payment intent API working
- [ ] Webhook receiving payments
- [ ] Checkout page functional
- [ ] Test card payment succeeds
- [ ] Confirmation page displays
- [ ] Email sent to customer
- [ ] Email sent to admin (Sherard)
- [ ] Order visible in database

**Deployment:**
```bash
git add .
git commit -m "Add Stripe card payments"
git push
# Auto-deploys to Vercel
```

---

## Phase 2: Bank Transfer (Week 2)

### Goal: Allow customers to pay via bank transfer with proof upload

### Step 2.1: Set Up Uploadthing (Day 5)
**Tasks:**
- [ ] Create Uploadthing account
- [ ] Get API keys
- [ ] Configure file upload

**Files:**
```
app/api/uploadthing/core.ts
app/api/uploadthing/route.ts
```

---

### Step 2.2: Build Bank Transfer Flow (Day 5-6)
**Components:**
- Bank details display
- File upload for screenshot
- Order creation (without payment)

**Files:**
```
components/checkout/BankTransferForm.tsx
components/checkout/PaymentProofUpload.tsx
app/api/checkout/upload-proof/route.ts
```

---

### Step 2.3: Build Payment Verification API (Day 6)
**File:** `app/api/admin/verify-payment/route.ts`

**What it does:**
- Admin approves/rejects payment
- Updates order status
- Sends email to customer

---

### Step 2.4: Build Admin Payment Verification UI (Day 6-7)
**File:** `app/admin/orders/page.tsx`

**Features:**
- List orders awaiting verification
- View payment screenshot
- Approve/reject buttons
- Add notes

---

### ✅ Phase 2 Complete Checklist

- [ ] Uploadthing configured
- [ ] Can upload payment screenshots
- [ ] Bank details display correctly
- [ ] Order created for bank transfer
- [ ] Admin receives notification email
- [ ] Admin can view screenshot
- [ ] Approve payment works
- [ ] Reject payment works
- [ ] Customer receives status emails

---

## Phase 3: Admin Dashboard (Week 2-3)

### Goal: Full order management for Sherard

### Step 3.1: Build Orders List (Day 8)
**Features:**
- View all orders
- Filter by status
- Search by order number
- Sort by date

---

### Step 3.2: Build Order Detail View (Day 8-9)
**Features:**
- View complete order info
- See customer details
- View payment proof (if bank transfer)
- Update order status
- Add tracking number
- Add admin notes

---

### Step 3.3: Build Dashboard Stats (Day 9)
**Features:**
- Total orders this month
- Total revenue
- Pending verifications
- Recent activity

---

### ✅ Phase 3 Complete Checklist

- [ ] Can view all orders
- [ ] Can filter and search
- [ ] Can view order details
- [ ] Can update order status
- [ ] Can add tracking numbers
- [ ] Can add admin notes
- [ ] Dashboard stats accurate

---

## Phase 4: Email Notifications (Week 3)

### Step 4.1: Set Up Resend (Day 10)
**Tasks:**
- [ ] Create Resend account
- [ ] Verify domain (or use resend.dev)
- [ ] Get API key

---

### Step 4.2: Implement All Email Templates (Day 10-11)
**Emails:**
- Order confirmation (card payment)
- Order confirmation (bank transfer)
- Payment verification needed (admin)
- Payment approved
- Payment rejected
- Order shipped
- Order ready for pickup

---

### ✅ Phase 4 Complete Checklist

- [ ] All emails sending
- [ ] Correct formatting
- [ ] Links work
- [ ] No spam folder issues

---

## Phase 5: Polish & Production (Week 3-4)

### Step 5.1: Security Audit (Day 12)
- [ ] Input validation (all forms)
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Environment variables secure

---

### Step 5.2: Error Handling (Day 12-13)
- [ ] Payment failures handled gracefully
- [ ] Database errors don't crash app
- [ ] User sees helpful error messages
- [ ] Admin gets error notifications

---

### Step 5.3: Testing (Day 13)
- [ ] End-to-end card payment
- [ ] End-to-end bank transfer
- [ ] Admin verification flow
- [ ] Email notifications
- [ ] Mobile responsive
- [ ] Cross-browser testing

---

### Step 5.4: Documentation (Day 13-14)
- [ ] Update README
- [ ] Update TRAINING_GUIDE
- [ ] Update CONFIGURATION_GUIDE
- [ ] Create ADMIN_MANUAL
- [ ] Create TROUBLESHOOTING_GUIDE

---

### Step 5.5: Production Deployment (Day 14)
- [ ] Switch Stripe to live mode
- [ ] Use production database
- [ ] Configure production webhook
- [ ] Set up monitoring (Sentry)
- [ ] Set up analytics
- [ ] Add custom domain
- [ ] SSL certificate (auto)
- [ ] Final testing

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| **Demo Deployment** | 1 day | ✅ Ready |
| **Phase 1: Card Payments** | 4 days | ⏳ Planned |
| **Phase 2: Bank Transfer** | 3 days | ⏳ Planned |
| **Phase 3: Admin Dashboard** | 2 days | ⏳ Planned |
| **Phase 4: Email Notifications** | 2 days | ⏳ Planned |
| **Phase 5: Polish & Production** | 3 days | ⏳ Planned |
| **Total** | **15 days** | |

---

## Working Method

For each step, we'll:

1. **Plan** - Review what needs to be built
2. **Build** - Write the code
3. **Test Locally** - Make sure it works on your machine
4. **Deploy** - Push to Vercel
5. **Test Live** - Verify it works on the live site
6. **Document** - Update guides
7. **Move to Next Step**

You can review and test each feature before we move on!

---

## Next Action

**Right now**: Deploy demo to Vercel (see DEPLOYMENT_GUIDE.md)

**After demo approved**: Start Phase 1, Step 1.1 (Set up database)

**Questions?** Let me know and we'll adjust the roadmap!

---

**Last Updated**: December 10, 2025
**Current Phase**: Demo Deployment
