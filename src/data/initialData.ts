import { RawMaterial, Recipe, Batch, Order, PerfumerProfile, DiscoveryConfig, ProductionStage, BottleSizeOption } from '../types';

export const getDefaultRecipeSizes = (manualPrice: number = 2899): BottleSizeOption[] => {
  const p50 = manualPrice;
  return [
    { sizeMl: 15, label: '15ml Travel Spray', price: Math.max(799, Math.round((p50 * 0.42) / 50) * 50 - 1), inStock: 0, packagingCost: 120 },
    { sizeMl: 30, label: '30ml Studio Flacon', price: Math.max(1299, Math.round((p50 * 0.68) / 50) * 50 - 1), inStock: 0, packagingCost: 210 },
    { sizeMl: 50, label: '50ml Signature Flacon', price: p50, inStock: 0, packagingCost: 340 },
    { sizeMl: 100, label: '100ml Grand Flacon', price: Math.max(2999, Math.round((p50 * 1.72) / 50) * 50 - 1), inStock: 0, packagingCost: 520 }
  ];
};

export const initialProfile: PerfumerProfile = {
  businessName: 'OSTIA',
  tagline: 'Artisan Micro-Batch Botanical & Molecular Formulations',
  perfumerName: 'Faisal Parvez',
  upiId: 'ostia@okaxis',
  currency: '₹',
  logoUrl: '/ostia-logo.png'
};

export const defaultProductionStages: ProductionStage[] = [
  {
    id: 'compounding',
    name: 'Weighing & Compounding',
    shortCode: 'Compounding',
    description: 'Measuring exact formula oils, absolutes, aroma molecules, and concentrate weighing in grams.',
    typicalDays: 1,
    color: 'text-purple-400 bg-purple-500/15 border-purple-500/30'
  },
  {
    id: 'dilution',
    name: 'Alcohol Dilution & Homogenizing',
    shortCode: 'Dilution',
    description: 'Blending with 99.9% perfume-grade ENA, magnetic stirring and initial chill settling.',
    typicalDays: 1,
    color: 'text-blue-400 bg-blue-500/15 border-blue-500/30'
  },
  {
    id: 'maceration',
    name: 'Cold Maceration / Aging',
    shortCode: 'Macerating',
    description: 'Dark climate-controlled resting (21-45 days) allowing molecular esterification and olfactory smoothing.',
    typicalDays: 30,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
  },
  {
    id: 'filtration',
    name: 'Fine Paper Filtration',
    shortCode: 'Filtration',
    description: 'Gravity filtering natural botanical waxes, lipids, and precipitates through fine grade filter discs.',
    typicalDays: 1,
    color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30'
  },
  {
    id: 'bottling',
    name: 'Flacon Bottling & Pump Crimping',
    shortCode: 'Bottling',
    description: 'Filling 50ml French glass bottles, testing fine mist atomizers, and precision crimping gold collars.',
    typicalDays: 1,
    color: 'text-orange-400 bg-orange-500/15 border-orange-500/30'
  },
  {
    id: 'labeling',
    name: 'Foil Labeling & Serial Numbering',
    shortCode: 'Labeling',
    description: 'Applying textured foil labels, inspection stamping, and handwritten batch numbering.',
    typicalDays: 1,
    color: 'text-pink-400 bg-pink-500/15 border-pink-500/30'
  },
  {
    id: 'stocked',
    name: 'Ready Flacons in Finished Stock',
    shortCode: 'Ready Flacons',
    description: 'Packaged in rigid presentation slide boxes with atomizers primed, ready for client delivery.',
    typicalDays: 0,
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
  }
];

export const initialDiscoveryConfig: DiscoveryConfig = {
  enabled: true,
  price: 899.00,
  vialCount: 3,
  vialSizeMl: 5,
  boxCost: 140.00
};

// ---------------------------------------------------------------------------
// CLEAN PRODUCTION SLATE: ZERO MOCK DATA
// Initial arrays start 100% blank for Faisal Parvez's real studio operations
// ---------------------------------------------------------------------------
export const initialMaterials: RawMaterial[] = [];
export const initialRecipes: Recipe[] = [];
export const initialBatches: Batch[] = [];
export const initialOrders: Order[] = [];
