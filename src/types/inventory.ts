export type InventoryTier = 'A' | 'B' | 'C';
export type WatchCondition = 'brand_new' | 'unworn' | 'excellent' | 'good';
export type WatchAvailability = 'in_stock' | 'incoming' | 'sold' | 'reserved';

export interface WatchSpecifications {
  movement: string;
  caseMaterial: string;
  diameter: string;
  waterResistance: string;
}

export interface Watch {
  id: string;
  slug: string;
  
  // Basic Info
  brand: string;
  model: string;
  reference: string;
  name: string;
  
  // Pricing
  price_php: number;
  price_usd?: number;
  
  // Details
  year?: number;
  condition: WatchCondition;
  box: boolean;
  papers: boolean;
  description: string;
  
  // Inventory
  tier: InventoryTier;
  availability: WatchAvailability;
  eta?: string; // For Tier B
  
  // Categorization
  category: string;
  
  // Media
  images: string[];
  
  // Technical
  specifications: WatchSpecifications;
  
  // Metadata
  facebook_post_url?: string;
  scraped_at?: string;
  created_at: string;
  updated_at: string;
}

// Backward compatibility with existing App.tsx interface
export interface CartItem extends Watch {
  quantity: number;
}
