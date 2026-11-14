export type MaterialType = 'oil' | 'alcohol' | 'bottle' | 'pump' | 'label' | 'box';

export interface RawMaterial {
  id: string;
  name: string;
  category: MaterialType;
  unit: 'g' | 'ml' | 'piece';
  costPerUnit: number; // in INR
  stockQty: number;
  reorderPoint: number;
  supplier?: string;
}

export interface RecipeIngredient {
  materialId: string;
  materialName: string;
  amountGrams: number;
  noteType: 'top' | 'heart' | 'base' | 'carrier';
}

export interface BottleSizeOption {
  sizeMl: number;         // e.g. 15, 30, 50, 100
  label: string;          // e.g. "15ml Travel Spray", "30ml Studio Bottle", "50ml Signature Bottle", "100ml Grand Bottle"
  price: number;          // in INR
  inStock: number;        // units available in this size
  packagingCost?: number; // packaging cost for this bottle size
}

export interface Recipe {
  id: string;
  name: string;
  tagline: string;
  concentration: string; // e.g. Extrait de Parfum (24%), Eau de Parfum (18%)
  batchVolumeMl: number;
  maturationDaysNeeded: number;
  ingredients: RecipeIngredient[];
  bottleMaterialCost: number; // in INR (sum of bottle, pump, collar, label, box for 50ml)
  manualPrice: number; // in INR set by perfumer (standard 50ml)
  bottlesYield: number; // e.g. 10 bottles of 50ml
  pyramid: {
    top: string[];
    heart: string[];
    base: string[];
  };
  inStockBottles: number;
  sizes?: BottleSizeOption[]; // Sizing tiers: 15ml, 30ml, 50ml, 100ml
  createdAt?: string;
}

export interface ProductionStage {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  typicalDays: number;
  color: string;
}

export interface BatchStageHistory {
  stageId: string;
  stageName: string;
  completedAt: string;
  notes?: string;
}

export interface Batch {
  id: string;
  batchNumber: string; // e.g. "Batch #04"
  recipeId: string;
  recipeName: string;
  brewDate: string; // ISO date YYYY-MM-DD
  targetDays: number;
  bottlesPlanned: number;
  bottlesBottled: number;
  status: 'macerating' | 'ready_to_bottle' | 'bottled';
  currentStageId: string; // e.g. 'compounding' | 'dilution' | 'maceration' | 'filtration' | 'bottling' | 'packaging' | 'stocked'
  stageDueDate?: string;
  stageNotes?: string;
  notes: string;
  stageHistory?: BatchStageHistory[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryNote: string;
  orderType?: 'full_bottle' | 'discovery_set';
  recipeId: string;
  recipeName: string;
  bottleSizeMl?: number; // e.g. 15, 30, 50, 100
  bottleSizeLabel?: string; // e.g. "50ml Signature Bottle" or "15ml Travel Spray"
  discoveryItems?: string[]; // Names of the 3 selected sample vials
  bottleSerial: string; // e.g. "Bottle 04 of 10" or "Discovery Set Box #08"
  price: number; // in INR
  paymentMethod: 'UPI' | 'Cash' | 'Pending';
  status: 'Pending Payment' | 'Paid' | 'Delivered';
  createdAt: string;
}

export interface PerfumerProfile {
  businessName: string;
  tagline: string;
  perfumerName: string;
  upiId: string;
  currency: string; // "₹"
  logoUrl?: string;
}

export interface DiscoveryConfig {
  enabled: boolean;
  price: number; // in INR (e.g. 899)
  vialCount: number; // e.g. 3
  vialSizeMl: number; // e.g. 5
  boxCost: number; // in INR (e.g. 140 for 3x vials + custom card box + labels)
}

export interface BottleTagData {
  recipeName: string;
  concentration: string;
  tagline: string;
  batchNumber: string;
  bottleSerial: string;
  bottleSizeMl?: number;
  bottleSizeLabel?: string;
  brewDate: string;
  maturationDays: number;
  pyramid: {
    top: string[];
    heart: string[];
    base: string[];
  };
  perfumerName: string;
  businessName: string;
}
