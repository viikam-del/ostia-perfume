export type MaterialType = 'oil' | 'alcohol' | 'bottle' | 'pump' | 'label' | 'box';

export interface RawMaterial {
  id: string;
  name: string;
  category: MaterialType;
  unit: 'g' | 'ml' | 'piece';
  costPerUnit: number;
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

export interface Recipe {
  id: string;
  name: string;
  tagline: string;
  concentration: string; // e.g. Extrait de Parfum (24%), Eau de Parfum (18%)
  batchVolumeMl: number;
  maturationDaysNeeded: number;
  ingredients: RecipeIngredient[];
  bottleMaterialCost: number; // sum of bottle + pump + collar + label + box
  manualPrice: number; // Direct manual price override set by perfumer
  bottlesYield: number; // e.g. 10 bottles of 50ml
  pyramid: {
    top: string[];
    heart: string[];
    base: string[];
  };
  inStockBottles: number;
}

export interface Batch {
  id: string;
  batchNumber: string; // e.g. "Batch #04"
  recipeId: string;
  recipeName: string;
  brewDate: string; // ISO date
  targetDays: number;
  bottlesPlanned: number;
  bottlesBottled: number;
  status: 'macerating' | 'ready_to_bottle' | 'bottled';
  notes: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryNote: string;
  recipeId: string;
  recipeName: string;
  bottleSerial: string; // e.g. "Bottle 04 of 12"
  price: number;
  paymentMethod: 'UPI' | 'Cash' | 'Pending';
  status: 'Pending Payment' | 'Paid' | 'Delivered';
  createdAt: string;
}

export interface PerfumerProfile {
  businessName: string;
  tagline: string;
  perfumerName: string;
  upiId: string;
  currency: string;
}
