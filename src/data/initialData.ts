import { RawMaterial, Recipe, Batch, Order, PerfumerProfile } from '../types';

export const initialProfile: PerfumerProfile = {
  businessName: 'Ostia',
  tagline: 'Handmade Micro-Batch Botanical & Molecular Fragrances',
  perfumerName: 'Aiden Vance',
  upiId: 'ostia@upi',
  currency: '$'
};

export const initialMaterials: RawMaterial[] = [
  // Oils & Aroma Molecules
  { id: 'mat-1', name: 'Italian Bergamot EO (FCF)', category: 'oil', unit: 'g', costPerUnit: 0.35, stockQty: 85, reorderPoint: 30, supplier: 'Eden Botanicals' },
  { id: 'mat-2', name: 'Cardamom & Pink Pepper CO2', category: 'oil', unit: 'g', costPerUnit: 0.50, stockQty: 40, reorderPoint: 20, supplier: 'Biolandes' },
  { id: 'mat-3', name: 'Mysore Sandalwood & Amber Core', category: 'oil', unit: 'g', costPerUnit: 0.85, stockQty: 60, reorderPoint: 25, supplier: 'Hermitage Oils' },
  { id: 'mat-4', name: 'Turkish Damask Rose Absolute', category: 'oil', unit: 'g', costPerUnit: 1.20, stockQty: 18, reorderPoint: 15, supplier: 'Robertet' },
  { id: 'mat-5', name: 'Ambroxan & Iso E Super Blend', category: 'oil', unit: 'g', costPerUnit: 0.40, stockQty: 95, reorderPoint: 30, supplier: 'Vedas Scent' },
  { id: 'mat-6', name: 'Haitian Vetiver & Birch Tar', category: 'oil', unit: 'g', costPerUnit: 0.60, stockQty: 32, reorderPoint: 20, supplier: 'Eden Botanicals' },

  // Carrier Alcohol
  { id: 'mat-7', name: "Perfumer's Alcohol (SDA-40B 99.9%)", category: 'alcohol', unit: 'ml', costPerUnit: 0.025, stockQty: 850, reorderPoint: 300, supplier: 'Culinary Solvent' },

  // Packaging Components
  { id: 'mat-8', name: '50ml Heavy Base Glass Flacon', category: 'bottle', unit: 'piece', costPerUnit: 2.10, stockQty: 8, reorderPoint: 10, supplier: 'GlassBoutique' },
  { id: 'mat-9', name: 'Fine Mist Gold Atomizer & Collar', category: 'pump', unit: 'piece', costPerUnit: 0.85, stockQty: 14, reorderPoint: 10, supplier: 'AromaPumps' },
  { id: 'mat-10', name: 'Textured Foil Stamped Label', category: 'label', unit: 'piece', costPerUnit: 0.40, stockQty: 35, reorderPoint: 15, supplier: 'StickerStudio' },
  { id: 'mat-11', name: 'Linen Finish Rigid Gift Box', category: 'box', unit: 'piece', costPerUnit: 1.10, stockQty: 9, reorderPoint: 10, supplier: 'BoxCraft' }
];

export const initialRecipes: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Golden Amber & Bergamot',
    tagline: 'Sunlit citrus evolving into resinous amber and warm woods',
    concentration: 'Extrait de Parfum (24%)',
    batchVolumeMl: 500, // 10 bottles of 50ml
    maturationDaysNeeded: 30,
    ingredients: [
      { materialId: 'mat-1', materialName: 'Italian Bergamot EO', amountGrams: 40.0, noteType: 'top' },
      { materialId: 'mat-2', materialName: 'Cardamom & Pink Pepper CO2', amountGrams: 25.0, noteType: 'heart' },
      { materialId: 'mat-3', materialName: 'Mysore Sandalwood & Amber', amountGrams: 55.0, noteType: 'base' },
      { materialId: 'mat-7', materialName: "Perfumer's Alcohol", amountGrams: 380.0, noteType: 'carrier' }
    ],
    bottleMaterialCost: 4.45, // 2.10 (bottle) + 0.85 (pump) + 0.40 (label) + 1.10 (box)
    manualPrice: 45.00,
    bottlesYield: 10,
    pyramid: {
      top: ['Italian Bergamot', 'Calabrian Lemon', 'Pink Pepper'],
      heart: ['Cardamom Pods', 'Smoked Incense'],
      base: ['Golden Amber', 'Mysore Sandalwood', 'Cedarwood']
    },
    inStockBottles: 5
  },
  {
    id: 'rec-2',
    name: 'Velvet Santal & Rose',
    tagline: 'Deep velvet Turkish rose infused with creamy sandalwood',
    concentration: 'Extrait de Parfum (22%)',
    batchVolumeMl: 500,
    maturationDaysNeeded: 35,
    ingredients: [
      { materialId: 'mat-1', materialName: 'Italian Bergamot EO', amountGrams: 20.0, noteType: 'top' },
      { materialId: 'mat-4', materialName: 'Turkish Damask Rose Absolute', amountGrams: 35.0, noteType: 'heart' },
      { materialId: 'mat-3', materialName: 'Mysore Sandalwood & Amber', amountGrams: 55.0, noteType: 'base' },
      { materialId: 'mat-7', materialName: "Perfumer's Alcohol", amountGrams: 390.0, noteType: 'carrier' }
    ],
    bottleMaterialCost: 4.45,
    manualPrice: 50.00,
    bottlesYield: 10,
    pyramid: {
      top: ['Dewy Bergamot', 'Cardamom Mist'],
      heart: ['Turkish Damask Rose', 'Violet Leaf'],
      base: ['Mysore Sandalwood', 'Ambroxan', 'White Musk']
    },
    inStockBottles: 3
  },
  {
    id: 'rec-3',
    name: 'Solstice Smoke & Vetiver',
    tagline: 'Earth, damp soil, cold forest air, and campfire smoke',
    concentration: 'Eau de Parfum (18%)',
    batchVolumeMl: 500,
    maturationDaysNeeded: 28,
    ingredients: [
      { materialId: 'mat-2', materialName: 'Cardamom & Pink Pepper CO2', amountGrams: 20.0, noteType: 'top' },
      { materialId: 'mat-6', materialName: 'Haitian Vetiver & Birch Tar', amountGrams: 50.0, noteType: 'heart' },
      { materialId: 'mat-5', materialName: 'Ambroxan & Iso E Super', amountGrams: 20.0, noteType: 'base' },
      { materialId: 'mat-7', materialName: "Perfumer's Alcohol", amountGrams: 410.0, noteType: 'carrier' }
    ],
    bottleMaterialCost: 4.45,
    manualPrice: 42.00,
    bottlesYield: 10,
    pyramid: {
      top: ['Crushed Pink Pepper', 'Juniper Berry'],
      heart: ['Haitian Vetiver Root', 'Birch Tar Smoke'],
      base: ['Iso E Super', 'Damp Moss', 'Clean Ambergris']
    },
    inStockBottles: 4
  }
];

export const initialBatches: Batch[] = [
  {
    id: 'batch-4',
    batchNumber: 'Batch #04',
    recipeId: 'rec-1',
    recipeName: 'Golden Amber & Bergamot',
    brewDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 19 days ago
    targetDays: 30,
    bottlesPlanned: 10,
    bottlesBottled: 0,
    status: 'macerating',
    notes: 'Brewed with high grade bergamot. Let rest in cool, dark cabinet.'
  },
  {
    id: 'batch-3',
    batchNumber: 'Batch #03',
    recipeId: 'rec-2',
    recipeName: 'Velvet Santal & Rose',
    brewDate: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 36 days ago
    targetDays: 35,
    bottlesPlanned: 10,
    bottlesBottled: 10,
    status: 'ready_to_bottle',
    notes: 'Maceration complete! Deep ruby tint and smooth dry-down achieved.'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-101',
    customerName: 'Rohan Sharma',
    customerPhone: '+91 98765 43210',
    deliveryNote: 'Leave at reception desk',
    recipeId: 'rec-1',
    recipeName: 'Golden Amber & Bergamot',
    bottleSerial: 'Bottle 04 of 10',
    price: 45.00,
    paymentMethod: 'UPI',
    status: 'Pending Payment',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-102',
    customerName: 'Priya Nair',
    customerPhone: '+91 98111 22334',
    deliveryNote: 'Gift wrap for birthday',
    recipeId: 'rec-2',
    recipeName: 'Velvet Santal & Rose',
    bottleSerial: 'Bottle 02 of 10',
    price: 50.00,
    paymentMethod: 'UPI',
    status: 'Paid',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-103',
    customerName: 'Karan Mehra',
    customerPhone: '+91 99887 76655',
    deliveryNote: 'Will pick up in person',
    recipeId: 'rec-3',
    recipeName: 'Solstice Smoke & Vetiver',
    bottleSerial: 'Bottle 01 of 10',
    price: 42.00,
    paymentMethod: 'Cash',
    status: 'Paid',
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString()
  }
];
