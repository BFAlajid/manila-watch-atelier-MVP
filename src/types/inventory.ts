export type InventoryTier = 'A' | 'B' | 'C';
export type WatchCondition = 'brand_new' | 'unworn' | 'excellent' | 'good';
export type WatchAvailability = 'in_stock' | 'incoming' | 'sold' | 'reserved';
export type WatchStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type MarketTrend = 'APPRECIATING' | 'STABLE' | 'DEPRECIATING';

export interface WatchSpecifications {
  movement?: string;
  caseMaterial?: string;
  diameter?: string;
  waterResistance?: string;
  powerReserve?: string;
  crystal?: string;
  [key: string]: string | undefined;
}

export interface Watch {
  id: string;
  slug: string;

  // Basic Info
  brand: string;
  model: string;
  reference: string;
  name: string;
  nickname?: string;

  // Pricing
  price_php: number;
  pricePHP?: number;
  retailPricePHP?: number;
  marketTrend?: MarketTrend;
  annualAppreciation?: number;

  // Details
  year?: number;
  caseDiameter?: number;
  caseMaterial?: string;
  dialColor?: string;
  movement?: string;
  caliber?: string;
  braceletType?: string;
  complications?: string[];
  condition: string;
  boxPapers?: string;
  box?: boolean;
  papers?: boolean;
  description: string;

  // Inventory
  tier: InventoryTier;
  availability: WatchAvailability;
  status?: WatchStatus;
  eta?: string;

  // Categorization
  category: string;
  featured?: boolean;

  // Media
  images: string[];
  video?: {
    type: 'youtube' | 'facebook' | 'upload' | 'url';
    url: string;
    thumbnail?: string;
  } | null;

  // Technical
  specifications: WatchSpecifications;

  // Stats
  viewCount?: number;
  inquiryCount?: number;

  // Metadata
  created_at: string;
  updated_at: string;
}
