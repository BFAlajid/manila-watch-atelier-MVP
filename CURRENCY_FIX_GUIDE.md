# Currency Conversion Fix Guide

## ❌ Current Issue

The currency conversion system is implemented but components are still using the old `formatPrice` function that only supports PHP/USD.

## 🔍 Root Cause

**Two different currency systems exist:**

1. **Old System** (`src/utils/currency.ts`):
   - Only supports PHP/USD toggle
   - Hardcoded exchange rate (0.018)
   - Used by: ProductCard, ProductGrid, WatchDetailPage, etc.

2. **New System** (`src/lib/currency.ts` + `WatchContext`):
   - Supports 20 currencies
   - Live exchange rates from API
   - Has `formatPrice` and `convertPrice` methods
   - ✅ Fully implemented but not used by components

## ✅ Solution

Components need to use `formatPrice` from `useWatch()` hook instead of `utils/currency.ts`

## 🛠️ Files That Need Updates

### 1. ProductCard.tsx
**Location:** `src/components/ProductCard.tsx`

**Current Code:**
```typescript
import { formatPrice } from '../utils/currency';

export function ProductCard({ watch }: ProductCardProps) {
  const { currencyMode, exchangeRate } = useWatch();
  const price = formatPrice(watch.price_php, currencyMode, exchangeRate);
  // ...
}
```

**Updated Code:**
```typescript
// Remove import from utils/currency
import { useWatch } from '../context/WatchContext';

export function ProductCard({ watch }: ProductCardProps) {
  const { formatPrice } = useWatch(); // Use from context
  const price = formatPrice(watch.price_php);
  // ...
}
```

### 2. ProductGrid.tsx
Same pattern as ProductCard

### 3. WatchDetailPage.tsx
**Current:**
```typescript
const price = formatPrice(watch.price_php, currencyMode, exchangeRate);
```

**Updated:**
```typescript
const { formatPrice } = useWatch();
const price = formatPrice(watch.price_php);
```

### 4. PaymentCalculator.tsx
Same pattern

### 5. ComparePage.tsx
Same pattern

---

## 📝 Step-by-Step Fix

### Step 1: Update ProductCard Component

```typescript
// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, TrendingUp } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { LowStockBadge } from './LowStockBadge';
import { FavoriteButton } from './FavoriteButton';
import { ComparisonButton } from './ComparisonButton';
import type { Watch } from '../types/inventory';

interface ProductCardProps {
  watch: Watch;
  index: number;
}

export function ProductCard({ watch, index }: ProductCardProps) {
  const { formatPrice } = useWatch(); // ✅ Use from context
  const price = formatPrice(watch.price_php); // ✅ Now supports all currencies

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-[#D4AF37] transition-all duration-300"
    >
      {/* ... rest of component ... */}
      <p className="text-2xl text-[#D4AF37] mb-2">{price}</p>
      {/* ... */}
    </motion.div>
  );
}
```

### Step 2: Update WatchDetailPage

```typescript
// src/pages/WatchDetailPage.tsx
export default function WatchDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<Watch | null>(null);

  const {
    addToRecentlyViewed,
    incrementViewCount,
    formatPrice // ✅ Use formatPrice from context
  } = useWatch();

  // ... existing code ...

  if (!watch) {
    return <div>Loading...</div>;
  }

  const price = formatPrice(watch.price_php); // ✅ Converts to selected currency

  return (
    <div>
      {/* ... */}
      <p className="text-5xl text-[#D4AF37] mb-2">{price}</p>
      {/* ... */}
    </div>
  );
}
```

### Step 3: Update PaymentCalculator

```typescript
// src/components/PaymentCalculator.tsx
export function PaymentCalculator({ price }: { price: number }) {
  const { formatPrice, currency } = useWatch();

  const displayPrice = formatPrice(price);
  const downPayment = formatPrice(price * 0.3);
  const monthly = formatPrice(price / 12);

  return (
    <div className="bg-neutral-900 rounded-xl p-6">
      <h3 className="text-lg font-medium mb-4">Payment Options</h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-400">Full Payment</span>
          <span className="text-white font-medium">{displayPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">30% Down</span>
          <span className="text-white font-medium">{downPayment}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">12-Month Plan</span>
          <span className="text-white font-medium">{monthly}/mo</span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        Prices shown in {currency}. Final amount in USD.
      </p>
    </div>
  );
}
```

---

## 🧪 Testing the Fix

1. **Start dev server**: `npm run dev`
2. **Open browser**: http://localhost:3002
3. **Open DevTools Console**: Check for exchange rate fetch
   - Should see: `Exchange rates loaded successfully`
4. **Click Currency Selector** in header
5. **Select different currency** (e.g., EUR, JPY, SGD)
6. **Verify prices update** across all product cards
7. **Navigate to watch detail page** - price should match selected currency
8. **Check payment calculator** - amounts should convert properly

---

## 🐛 Debugging Currency Issues

### Check if Exchange Rates Loaded

```javascript
// In browser console:
const rates = localStorage.getItem('manila-watch-exchange-rates');
console.log(JSON.parse(rates));
```

Should show:
```json
{
  "base": "PHP",
  "rates": {
    "USD": 0.018,
    "EUR": 0.016,
    "JPY": 2.68,
    ...
  },
  "timestamp": 1702348800000
}
```

### Check Selected Currency

```javascript
// In browser console:
localStorage.getItem('manila-watch-currency');
```

Should show: `"PHP"`, `"USD"`, etc.

### Force Refresh Exchange Rates

```javascript
// In browser console:
localStorage.removeItem('manila-watch-exchange-rates');
// Reload page - will fetch fresh rates
```

---

## 🎯 Expected Behavior After Fix

✅ **Currency Selector appears** in header (with flags and currency names)
✅ **Prices auto-convert** when changing currency
✅ **Proper formatting** for each currency:
  - USD: $1,250
  - EUR: €1,150
  - JPY: ¥193,000 (no decimals)
  - PHP: ₱72,500
✅ **Prices persist** across page navigation
✅ **Exchange rates refresh** every hour automatically
✅ **Fallback rates** work if API fails

---

## 🚀 Quick Fix Script

Run this to update all components at once:

```bash
# Find all files using old formatPrice
grep -r "from '../utils/currency'" src/components src/pages

# Files to update:
# - src/components/ProductCard.tsx
# - src/components/ProductGrid.tsx
# - src/pages/WatchDetailPage.tsx
# - src/components/PaymentCalculator.tsx
# - src/pages/ComparePage.tsx
```

For each file, change:
```typescript
// OLD
import { formatPrice } from '../utils/currency';
const { currencyMode, exchangeRate } = useWatch();
const price = formatPrice(watch.price_php, currencyMode, exchangeRate);

// NEW
const { formatPrice } = useWatch();
const price = formatPrice(watch.price_php);
```

---

## ✅ Verification Checklist

After applying fixes, verify:

- [ ] Currency selector visible in header
- [ ] Can select from 20 different currencies
- [ ] Product card prices update when currency changes
- [ ] Watch detail page price updates
- [ ] Payment calculator amounts update
- [ ] Compare page prices update
- [ ] Prices formatted correctly (symbols, decimals)
- [ ] Selected currency persists on refresh
- [ ] Exchange rates cached (check Network tab)
- [ ] No console errors

---

## 📊 Currency Coverage

| Currency | Symbol | Format Example | Test Status |
|----------|--------|----------------|-------------|
| PHP | ₱ | ₱72,500.00 | ⏳ Pending |
| USD | $ | $1,250.00 | ⏳ Pending |
| EUR | € | €1,150.50 | ⏳ Pending |
| GBP | £ | £1,020.00 | ⏳ Pending |
| JPY | ¥ | ¥193,000 | ⏳ Pending |
| CNY | ¥ | ¥9,425 | ⏳ Pending |
| SGD | S$ | S$1,740 | ⏳ Pending |

---

## 💡 Pro Tips

1. **Test with JPY/KRW** - They don't use decimals, good edge case
2. **Test with VND/IDR** - Very large numbers, tests formatting
3. **Test offline** - Should use fallback rates
4. **Test mobile** - Currency selector should work on small screens
5. **Check WhatsApp links** - Should include selected currency in message

---

## 🎓 How the System Works

```
User Selects Currency (e.g., EUR)
         ↓
WatchContext.setCurrency('EUR')
         ↓
Updates localStorage('manila-watch-currency', 'EUR')
         ↓
formatPrice(72500) called
         ↓
convertPrice(72500, 'EUR', rates) → 1160
         ↓
formatCurrency(1160, 'EUR') → '€1,160.00'
         ↓
Display to User
```

## Need More Help?

Check these files for reference:
- `src/lib/currency.ts` - Core conversion logic
- `src/context/WatchContext.tsx` - Integration
- `src/components/CurrencySelector.tsx` - UI component
