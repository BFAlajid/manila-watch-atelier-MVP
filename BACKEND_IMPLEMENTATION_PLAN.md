# Backend Implementation Plan - Manila Watch Atelier

## Overview
Minimal but complete backend to support:
- Card payments (Stripe)
- Bank transfer with screenshot verification
- Order management
- Admin approval workflow
- Shipping vs Pickup selection
- Email notifications

## Tech Stack Decision

### Backend Framework: **Next.js 14+ App Router**
- Seamless migration from current Vite setup
- API routes built-in
- Same React components work as-is
- TypeScript throughout

### Database: **PostgreSQL with Prisma ORM**
- Production-ready reliability
- Type-safe queries
- Easy migrations

### Payment: **Stripe**
- 3.5% + ₱15 per transaction
- International card support
- Built-in fraud protection

### File Storage: **Uploadthing**
- Free tier: 2GB storage
- Easy integration
- Direct upload from browser

### Email: **Resend**
- Free tier: 100 emails/day
- Simple API
- Good deliverability

### Hosting: **Vercel + Vercel Postgres**
- Free tier for testing
- Easy deployment
- Auto-scaling

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  createdAt DateTime @default(now())

  orders    Order[]
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique // MWA-2025-0001

  // Customer
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])

  // Watch Details
  watchId         String
  watchBrand      String
  watchModel      String
  watchReference  String?

  // Pricing (stored in PHP)
  pricePhp        Decimal       @db.Decimal(10, 2)
  shippingCost    Decimal       @db.Decimal(10, 2) @default(0)
  totalPhp        Decimal       @db.Decimal(10, 2)

  // Display currency (what customer saw)
  displayCurrency String
  displayTotal    Decimal       @db.Decimal(10, 2)
  exchangeRate    Decimal       @db.Decimal(10, 6)

  // Payment
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)

  // Stripe payment
  stripePaymentId String?       @unique

  // Bank transfer
  paymentProofUrl String?       // Screenshot URL
  bankReference   String?       // Customer's bank reference

  // Fulfillment
  fulfillmentType FulfillmentType

  // Shipping details (if applicable)
  shippingName    String?
  shippingPhone   String?
  shippingAddress String?       @db.Text
  shippingCity    String?
  shippingPostal  String?
  trackingNumber  String?

  // Pickup details (if applicable)
  pickupDate      DateTime?
  pickupTime      String?
  pickupNotes     String?       @db.Text

  // Order lifecycle
  status          OrderStatus   @default(PENDING)
  notes           String?       @db.Text
  adminNotes      String?       @db.Text

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([customerId])
  @@index([orderNumber])
  @@index([paymentStatus])
  @@index([status])
}

enum PaymentMethod {
  STRIPE_CARD
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  AWAITING_VERIFICATION  // Bank transfer uploaded, waiting admin approval
  VERIFIED               // Payment confirmed
  FAILED
  REFUNDED
}

enum FulfillmentType {
  SHIPPING
  PICKUP
}

enum OrderStatus {
  PENDING                // Just created
  PAYMENT_PENDING        // Waiting for payment
  PAYMENT_VERIFIED       // Payment confirmed
  PROCESSING             // Preparing order
  READY_FOR_PICKUP       // Pickup orders only
  SHIPPED                // Shipping orders only
  DELIVERED              // Completed
  CANCELLED
}

// For admin users (keeping simple)
model AdminUser {
  id       String @id @default(cuid())
  email    String @unique
  password String // Hashed
  name     String
  role     String @default("ADMIN")
}
```

---

## API Routes Structure

```
app/api/
├── checkout/
│   ├── create-order/route.ts          # Create order (both payment types)
│   ├── stripe-intent/route.ts         # Create Stripe payment intent
│   └── upload-proof/route.ts          # Upload bank transfer proof
├── stripe/
│   └── webhook/route.ts               # Stripe payment confirmation
├── orders/
│   ├── [id]/route.ts                  # Get single order
│   └── customer/[email]/route.ts      # Get customer orders
├── admin/
│   ├── orders/route.ts                # List all orders (admin only)
│   ├── orders/[id]/route.ts           # Update order status
│   ├── verify-payment/route.ts        # Approve/reject bank transfer
│   └── stats/route.ts                 # Dashboard stats
└── watches/
    └── update-stock/route.ts          # Mark watch as sold
```

---

## User Flow Diagrams

### Flow 1: Card Payment (Stripe)

```
1. Customer adds watch to cart
2. Clicks "Checkout"
3. Fills shipping/pickup details
4. Selects "Credit/Debit Card"
5. Enters card (Stripe Elements)
   ↓
6. Frontend calls: POST /api/checkout/create-order
   - Creates order in DB (status: PAYMENT_PENDING)
   - Returns order ID
   ↓
7. Frontend calls: POST /api/checkout/stripe-intent
   - Creates Stripe PaymentIntent
   - Returns clientSecret
   ↓
8. Customer confirms payment
9. Stripe processes payment
   ↓
10. Stripe webhook: POST /api/stripe/webhook
    - Updates order: PAYMENT_VERIFIED
    - Sends email to customer
    - Sends email to Sherard
    ↓
11. Customer sees success page
12. Sherard sees order in admin dashboard
```

### Flow 2: Bank Transfer

```
1. Customer adds watch to cart
2. Clicks "Checkout"
3. Fills shipping/pickup details
4. Selects "Bank Transfer"
5. Sees bank details:

   BDO: 1234-5678-9012
   Account Name: Sherard W Ng
   Amount: ₱850,000

6. Customer makes payment via banking app
7. Takes screenshot
   ↓
8. Frontend calls: POST /api/checkout/create-order
   - Creates order (status: PAYMENT_PENDING)
   ↓
9. Customer uploads screenshot
   POST /api/checkout/upload-proof
   - Uploads to Uploadthing
   - Updates order: AWAITING_VERIFICATION
   - Sends email to Sherard: "New payment to verify"
   ↓
10. Sherard opens admin dashboard
11. Views payment screenshot
12. Clicks "Approve Payment"
    POST /api/admin/verify-payment
    - Updates order: PAYMENT_VERIFIED
    - Sends email to customer: "Payment confirmed!"
    ↓
13. Sherard prepares order for shipping/pickup
14. Updates status to SHIPPED or READY_FOR_PICKUP
```

---

## Key Features Implementation

### 1. Payment Method Selection

```tsx
// components/checkout/PaymentMethodSelector.tsx

export function PaymentMethodSelector({ onSelect }: Props) {
  const [method, setMethod] = useState<'card' | 'bank'>('card');

  return (
    <div className="space-y-4">
      <h3>Payment Method</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Card Payment */}
        <button
          onClick={() => setMethod('card')}
          className={method === 'card' ? 'active' : ''}
        >
          <CreditCard />
          <span>Credit/Debit Card</span>
          <span className="text-sm">Pay with Stripe (3.5% fee)</span>
        </button>

        {/* Bank Transfer */}
        <button
          onClick={() => setMethod('bank')}
          className={method === 'bank' ? 'active' : ''}
        >
          <Building2 />
          <span>Bank Transfer</span>
          <span className="text-sm">Direct bank deposit (No fees)</span>
        </button>
      </div>

      {method === 'bank' && <BankTransferInstructions />}
      {method === 'card' && <StripeCardForm />}
    </div>
  );
}
```

### 2. Bank Transfer Instructions

```tsx
export function BankTransferInstructions({ totalPhp }: Props) {
  return (
    <div className="bg-neutral-900 border border-[#D4AF37] rounded-lg p-6">
      <h4>Bank Account Details</h4>

      <div className="space-y-3 mt-4">
        <div>
          <label>Bank Name</label>
          <p className="font-mono">BDO Unibank</p>
        </div>

        <div>
          <label>Account Name</label>
          <p className="font-mono">Sherard W Ng</p>
        </div>

        <div>
          <label>Account Number</label>
          <div className="flex items-center gap-2">
            <p className="font-mono">1234-5678-9012-3456</p>
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>

        <div>
          <label>Amount to Transfer</label>
          <p className="text-2xl font-bold text-[#D4AF37]">
            ₱{totalPhp.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h5>Next Steps:</h5>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Transfer the exact amount to the account above</li>
          <li>Take a screenshot of the successful transaction</li>
          <li>Upload the screenshot below</li>
          <li>Wait for payment verification (usually within 2 hours)</li>
        </ol>
      </div>
    </div>
  );
}
```

### 3. Screenshot Upload

```tsx
export function PaymentProofUpload({ orderId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', orderId);

    const response = await fetch('/api/checkout/upload-proof', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      // Show success message
      // Redirect to order confirmation
    }
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-8">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {file && (
        <div className="mt-4">
          <img src={URL.createObjectURL(file)} alt="Preview" />
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit Payment Proof'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 4. Admin Order Management

```tsx
// app/admin/orders/page.tsx

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  return (
    <div className="p-8">
      <h1>Order Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Payment" value={pendingCount} />
        <StatCard label="Awaiting Verification" value={verificationCount} />
        <StatCard label="Processing" value={processingCount} />
        <StatCard label="Completed" value={completedCount} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setFilter('all')}>All Orders</Button>
        <Button onClick={() => setFilter('pending')}>Needs Action</Button>
        <Button onClick={() => setFilter('verified')}>Verified</Button>
      </div>

      {/* Orders Table */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Watch</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow key={order.id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. Payment Verification Modal

```tsx
export function PaymentVerificationModal({ order }: Props) {
  const [notes, setNotes] = useState('');

  const approvePayment = async () => {
    await fetch(`/api/admin/verify-payment`, {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.id,
        action: 'APPROVE',
        notes
      })
    });

    // Refresh orders list
    // Show success toast
  };

  const rejectPayment = async () => {
    await fetch(`/api/admin/verify-payment`, {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.id,
        action: 'REJECT',
        notes
      })
    });
  };

  return (
    <Dialog>
      <div className="max-w-2xl">
        <h2>Verify Payment - {order.orderNumber}</h2>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label>Customer</label>
            <p>{order.customer.name}</p>
            <p className="text-sm">{order.customer.email}</p>
          </div>

          <div>
            <label>Amount</label>
            <p className="text-xl">₱{order.totalPhp.toLocaleString()}</p>
          </div>

          <div>
            <label>Watch</label>
            <p>{order.watchBrand} {order.watchModel}</p>
          </div>

          <div>
            <label>Bank Reference</label>
            <p>{order.bankReference || 'N/A'}</p>
          </div>
        </div>

        {/* Payment Screenshot */}
        <div className="mb-6">
          <label>Payment Proof</label>
          <img
            src={order.paymentProofUrl}
            alt="Payment proof"
            className="border rounded-lg max-h-96"
          />
          <a href={order.paymentProofUrl} target="_blank" className="text-sm">
            Open in new tab →
          </a>
        </div>

        {/* Admin Notes */}
        <div className="mb-6">
          <label>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this payment..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={approvePayment} variant="success">
            ✓ Approve Payment
          </Button>
          <Button onClick={rejectPayment} variant="danger">
            ✗ Reject Payment
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
```

---

## Migration Steps from Vite to Next.js

### Step 1: Install Dependencies

```bash
npm install next@latest react@latest react-dom@latest
npm install prisma @prisma/client
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install uploadthing @uploadthing/react
npm install resend
npm install bcryptjs
npm install zod
```

### Step 2: Create Next.js Config

```js
// next.config.js
module.exports = {
  images: {
    domains: ['utfs.io'], // Uploadthing domain
  },
  experimental: {
    serverActions: true,
  },
};
```

### Step 3: Restructure Folders

```
manila-watch-atelier/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── inventory/
│   │   └── page.tsx
│   ├── watch/
│   │   └── [slug]/page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── order-confirmation/
│   │   └── [id]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── orders/page.tsx
│   │   └── login/page.tsx
│   └── api/                    # API routes
│       ├── checkout/
│       ├── stripe/
│       ├── admin/
│       └── watches/
├── components/                  # Keep existing
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── stripe.ts               # Stripe client
│   ├── email.ts                # Email service
│   └── auth.ts                 # Auth helpers
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/                     # Keep existing
```

### Step 4: Convert Components

Most components work as-is, just add `'use client'` directive:

```tsx
// components/ProductCard.tsx
'use client';

import { motion } from 'motion/react';
// ... rest stays the same
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Uploadthing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Resend
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="sherard@manilawatch.com"
```

---

## Deployment Checklist

- [ ] Set up Vercel Postgres database
- [ ] Run Prisma migrations
- [ ] Set environment variables in Vercel
- [ ] Configure Stripe webhook endpoint
- [ ] Test card payment flow
- [ ] Test bank transfer flow
- [ ] Test admin verification
- [ ] Deploy to production
- [ ] Update DNS (if custom domain)

---

**Implementation Time Estimate: 3-4 days**
**Total Cost: Hosting + Database = ~₱500-1000/month**
