# Adding New Watches to Manila Watch Atelier

## Quick Guide

You can add watches in two ways:

### **Method 1: Admin Panel (Recommended)** 🎯

1. Navigate to `#/admin` in your browser (or click the admin link)
2. Login with credentials: `admin` / `manila2024`
3. Click **"Add New Watch"** button
4. Fill out the form with watch details
5. Click **"Save Watch"** - Done!

### **Method 2: Manual JSON Edit**

To add a new watch to your inventory manually, follow these steps:

### 1. Add Watch Images

1. Save your watch images to the `/public/watches/` folder
2. Name them descriptively, e.g., `rolex-submariner-001.jpg`

### 2. Update inventory.json

Open `/data/inventory.json` and add a new entry following this template:

```json
{
  "id": "watch-009",
  "slug": "rolex-submariner-hulk-116610lv",
  "brand": "Rolex",
  "model": "Submariner",
  "reference": "116610LV",
  "name": "Submariner 'Hulk' Green Dial",
  "price_php": 1850000,
  "condition": "excellent",
  "box": true,
  "papers": true,
  "tier": "A",
  "availability": "in_stock",
  "category": "Sport",
  "description": "The legendary 'Hulk' Submariner with striking green dial and ceramic bezel...",
  "images": [
    "/watches/rolex-submariner-hulk-001.jpg"
  ],
  "specifications": {
    "movement": "Caliber 3135 Automatic",
    "caseMaterial": "Stainless Steel 904L",
    "diameter": "40mm",
    "waterResistance": "300m"
  },
  "created_at": "2024-12-09T00:00:00Z",
  "updated_at": "2024-12-09T00:00:00Z"
}
```

### 3. Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier | `"watch-009"` |
| `slug` | string | URL-friendly name | `"rolex-submariner-hulk-116610lv"` |
| `brand` | string | Watch manufacturer | `"Rolex"`, `"Patek Philippe"`, `"Audemars Piguet"` |
| `model` | string | Model name | `"Submariner"`, `"Nautilus"`, `"Royal Oak"` |
| `reference` | string | Reference number | `"116610LV"` |
| `name` | string | Display name | `"Submariner 'Hulk' Green Dial"` |
| `price_php` | number | Price in Philippine Pesos | `1850000` |
| `condition` | string | Condition | `"brand_new"`, `"unworn"`, `"excellent"`, `"good"` |
| `box` | boolean | Includes original box | `true` or `false` |
| `papers` | boolean | Includes papers | `true` or `false` |
| `tier` | string | Inventory tier | `"A"` (In Hand), `"B"` (Incoming), `"C"` (On Demand) |
| `availability` | string | Stock status | `"in_stock"`, `"incoming"`, `"sold"`, `"reserved"` |
| `category` | string | Category | `"Sport"`, `"Luxury"`, `"Dress"` |
| `description` | string | Detailed description | Full paragraph describing the watch |
| `images` | array | Image paths | `["/watches/image1.jpg", "/watches/image2.jpg"]` |
| `specifications` | object | Technical specs | See below |

### 4. Specifications Object

```json
"specifications": {
  "movement": "Caliber 3135 Automatic",
  "caseMaterial": "Stainless Steel 904L", 
  "diameter": "40mm",
  "waterResistance": "300m"
}
```

### 5. Categories

Use one of these categories:
- **Sport**: Dive watches, GMT, Aviation (Submariner, GMT-Master, Daytona)
- **Luxury**: Precious metals, diamonds, dress watches (Day-Date, Nautilus, Royal Oak)
- **Dress**: Classic dress watches (Datejust, Calatrava)

### 6. Inventory Tiers

- **Tier A (In Hand)**: Watch is physically in inventory, ready to ship in 1-3 days
- **Tier B (Incoming)**: Watch is secured but not yet received, add `eta` field with date
- **Tier C (On Demand)**: Can be sourced upon request

Example for Tier B:
```json
{
  "tier": "B",
  "availability": "incoming",
  "eta": "2024-12-20"
}
```

### 7. Save and Test

1. Save the `inventory.json` file
2. Refresh your browser
3. The new watch should appear in the collection

### 8. Tips

- **ID Numbers**: Continue the sequence (watch-009, watch-010, etc.)
- **Slugs**: Use lowercase, separate words with hyphens, include brand-model-reference
- **Images**: Multiple images are supported, first image is shown in grid
- **Pricing**: Always use full PHP amount (no decimals, no currency symbols)
- **Descriptions**: Write compelling, detailed descriptions highlighting unique features
- **References**: Include official reference numbers for authenticity

### 9. Example: Adding a Patek Philippe

```json
{
  "id": "watch-009",
  "slug": "patek-philippe-aquanaut-5167a",
  "brand": "Patek Philippe",
  "model": "Aquanaut",
  "reference": "5167A-001",
  "name": "Aquanaut 40mm Steel",
  "price_php": 3200000,
  "condition": "brand_new",
  "box": true,
  "papers": true,
  "tier": "B",
  "availability": "incoming",
  "eta": "2024-12-25",
  "category": "Sport",
  "description": "The iconic Patek Philippe Aquanaut in stainless steel. Features the distinctive embossed dial pattern, tropical composite strap, and the elegant Calatrava cross crown. This modern sports watch from the Holy Trinity represents the perfect blend of sportiness and haute horlogerie craftsmanship.",
  "images": [
    "/watches/patek-aquanaut-001.jpg",
    "/watches/patek-aquanaut-002.jpg"
  ],
  "specifications": {
    "movement": "Caliber 324 S C Automatic",
    "caseMaterial": "Stainless Steel",
    "diameter": "40mm",
    "waterResistance": "120m"
  },
  "facebook_post_url": "https://www.facebook.com/sherard.ng/posts/12345",
  "created_at": "2024-12-09T10:30:00Z",
  "updated_at": "2024-12-09T10:30:00Z"
}
```

---

## Admin Panel Features

The admin panel provides:
- ✅ **Dashboard Statistics** - Total inventory, in-stock count, total value
- ✅ **Add Watch Form** - User-friendly interface for adding new watches
- ✅ **Inventory Management** - View, delete watches with visual previews
- ✅ **Real-time Updates** - Changes appear immediately on the frontend
- ✅ **Secure Login** - Protected admin access

**Access Admin:** Navigate to `#/admin` or add `/admin` to your URL  
**Default Login:** Username: `admin` | Password: `manila2024`

---

**Questions?** Contact the developer or refer to `/types/inventory.ts` for the full TypeScript interface.