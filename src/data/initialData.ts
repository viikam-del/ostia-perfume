import { RawMaterial, Recipe, Batch, Order, PerfumerProfile, DiscoveryConfig, ProductionStage } from '../types';

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
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
  },
  {
    id: 'packaging',
    name: 'Labeling, Boxing & QC',
    shortCode: 'Packaging',
    description: 'Affixing waterproof foil labels, limited-edition serial tags, inserting into rigid magnetic box.',
    typicalDays: 1,
    color: 'text-pink-400 bg-pink-500/15 border-pink-500/30'
  },
  {
    id: 'stocked',
    name: 'Finished Stock Ready on Shelf',
    shortCode: 'Stocked',
    description: 'Production complete! Finished bottles logged and ready for customer dispatch.',
    typicalDays: 0,
    color: 'text-emerald-400 bg-emerald-500/25 border-emerald-500/50'
  }
];

export const initialDiscoveryConfig: DiscoveryConfig = {
  enabled: true,
  price: 899.00,
  vialCount: 3,
  vialSizeMl: 5,
  boxCost: 140.00
};

// Realistic Indian Artisan Perfumer Inventory in INR
export const initialMaterials: RawMaterial[] = [
  // Fragrance Oils & Aroma Molecules (Cost per gram in INR)
  { id: 'mat-1', name: 'Italian Bergamot FCF Essential Oil', category: 'oil', unit: 'g', costPerUnit: 28.00, stockQty: 120, reorderPoint: 40, supplier: 'Biolandes / Fine Aroma India' },
  { id: 'mat-2', name: 'Cardamom & Pink Pepper CO2 Extract', category: 'oil', unit: 'g', costPerUnit: 42.00, stockQty: 65, reorderPoint: 25, supplier: 'Synthite / Kerala Botanicals' },
  { id: 'mat-3', name: 'Mysore Sandalwood & Amber Accord', category: 'oil', unit: 'g', costPerUnit: 95.00, stockQty: 80, reorderPoint: 30, supplier: 'Karnataka Soaps & Aromas' },
  { id: 'mat-4', name: 'Kannauj Damask Rose Absolute', category: 'oil', unit: 'g', costPerUnit: 140.00, stockQty: 25, reorderPoint: 15, supplier: 'Kannauj Traditional Distillers' },
  { id: 'mat-5', name: 'Ambroxan & Iso E Super Complex', category: 'oil', unit: 'g', costPerUnit: 32.00, stockQty: 150, reorderPoint: 50, supplier: 'Privi Speciality Chemicals' },
  { id: 'mat-6', name: 'Haitian Vetiver & Smoked Birch Tar', category: 'oil', unit: 'g', costPerUnit: 48.00, stockQty: 45, reorderPoint: 20, supplier: 'Robertet India' },

  // Carrier Alcohol (Extra Neutral Alcohol 99.9% Perfume Grade - Cost per ml in INR)
  { id: 'mat-7', name: 'Perfumers ENA (SDA-40B 99.9%)', category: 'alcohol', unit: 'ml', costPerUnit: 0.25, stockQty: 1200, reorderPoint: 400, supplier: 'Distilco Pure Solvents' },

  // Packaging Components for Full 50ml Flacons
  { id: 'mat-8', name: '50ml Heavy Base Flacon (French Glass)', category: 'bottle', unit: 'piece', costPerUnit: 160.00, stockQty: 12, reorderPoint: 15, supplier: 'Verallia / GlassCraft Mumbai' },
  { id: 'mat-9', name: 'Gold Fine Mist Atomizer + Collar (FEA 15)', category: 'pump', unit: 'piece', costPerUnit: 65.00, stockQty: 18, reorderPoint: 15, supplier: 'AromaPumps Delhi' },
  { id: 'mat-10', name: 'Textured Foil Stamped Label (Waterproof)', category: 'label', unit: 'piece', costPerUnit: 25.00, stockQty: 45, reorderPoint: 20, supplier: 'PrintNest Bengaluru' },
  { id: 'mat-11', name: 'Rigid Linen Finish Magnetic Gift Box', category: 'box', unit: 'piece', costPerUnit: 90.00, stockQty: 10, reorderPoint: 12, supplier: 'BoxCrafters Jaipur' },

  // Discovery Sample Packaging
  { id: 'mat-12', name: '5ml Glass Atomizer Spray Vials', category: 'bottle', unit: 'piece', costPerUnit: 25.00, stockQty: 42, reorderPoint: 15, supplier: 'MiniPackaging Delhi' },
  { id: 'mat-13', name: 'Discovery Sampler Sleeve Box (3-Slot)', category: 'box', unit: 'piece', costPerUnit: 40.00, stockQty: 20, reorderPoint: 10, supplier: 'BoxCrafters Jaipur' }
];

export const initialRecipes: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Golden Amber & Bergamot',
    tagline: 'Sunlit Calabrian bergamot infused with spiced amber resin and warm cedar',
    concentration: 'Extrait de Parfum (24%)',
    batchVolumeMl: 500, // 10 bottles of 50ml
    maturationDaysNeeded: 30,
    ingredients: [
      { materialId: 'mat-1', materialName: 'Italian Bergamot FCF', amountGrams: 40.0, noteType: 'top' },
      { materialId: 'mat-2', materialName: 'Cardamom & Pink Pepper CO2', amountGrams: 25.0, noteType: 'heart' },
      { materialId: 'mat-3', materialName: 'Mysore Sandalwood & Amber', amountGrams: 55.0, noteType: 'base' },
      { materialId: 'mat-7', materialName: 'Perfumers ENA', amountGrams: 380.0, noteType: 'carrier' }
    ],
    bottleMaterialCost: 340.00, // ₹160 bottle + ₹65 pump + ₹25 label + ₹90 box
    manualPrice: 2899.00,
    bottlesYield: 10,
    pyramid: {
      top: ['Calabrian Bergamot', 'Pink Pepper', 'Sweet Orange'],
      heart: ['Cardamom Pods', 'Frankincense Tears', 'Black Tea'],
      base: ['Mysore Sandalwood', 'Amber Resin', 'Virginian Cedar']
    },
    inStockBottles: 6
  },
  {
    id: 'rec-2',
    name: 'Velvet Santal & Rose',
    tagline: 'Rich Kannauj Damask rose absolute layered over creamy sandalwood and warm skin musk',
    concentration: 'Extrait de Parfum (22%)',
    batchVolumeMl: 500,
    maturationDaysNeeded: 35,
    ingredients: [
      { materialId: 'mat-1', materialName: 'Italian Bergamot FCF', amountGrams: 20.0, noteType: 'top' },
      { materialId: 'mat-4', materialName: 'Kannauj Damask Rose Absolute', amountGrams: 35.0, noteType: 'heart' },
      { materialId: 'mat-3', materialName: 'Mysore Sandalwood & Amber', amountGrams: 55.0, noteType: 'base' },
      { materialId: 'mat-7', materialName: 'Perfumers ENA', amountGrams: 390.0, noteType: 'carrier' }
    ],
    bottleMaterialCost: 340.00,
    manualPrice: 3299.00,
    bottlesYield: 10,
    pyramid: {
      top: ['Morning Dew Bergamot', 'Green Violet Leaf'],
      heart: ['Kannauj Damask Rose', 'Turkish Rose Petals'],
      base: ['Mysore Sandalwood', 'Ambroxan', 'Velvet Cashmeran']
    },
    inStockBottles: 4
  },
  {
    id: 'rec-3',
    name: 'Solstice Smoke & Vetiver',
    tagline: 'Petrichor, cold mountain mist, charred birch wood, and earthy vetiver roots',
    concentration: 'Eau de Parfum (18%)',
    batchVolumeMl: 500,
    maturationDaysNeeded: 28,
    ingredients: [
      { materialId: 'mat-2', materialName: 'Cardamom & Pink Pepper CO2', amountGrams: 20.0, noteType: 'top' },
      { materialId: 'mat-6', materialName: 'Haitian Vetiver & Smoked Birch Tar', amountGrams: 50.0, noteType: 'heart' },
      { materialId: 'mat-5', materialName: 'Ambroxan & Iso E Super', amountGrams: 20.0, noteType: 'base' },
      { materialId: 'mat-7', materialName: 'Perfumers ENA', amountGrams: 410.0, noteType: 'carrier' }
    ],
    bottleMaterialCost: 340.00,
    manualPrice: 2499.00,
    bottlesYield: 10,
    pyramid: {
      top: ['Crushed Pink Peppercorns', 'Wild Juniper'],
      heart: ['Smoked Birch Wood', 'Haitian Vetiver Roots'],
      base: ['Iso E Super', 'Clean Petrichor', 'Earthy Oakmoss']
    },
    inStockBottles: 5
  }
];

export const initialBatches: Batch[] = [
  {
    id: 'batch-4',
    batchNumber: 'Batch #04',
    recipeId: 'rec-1',
    recipeName: 'Golden Amber & Bergamot',
    brewDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days ago
    targetDays: 30,
    bottlesPlanned: 10,
    bottlesBottled: 0,
    status: 'macerating',
    currentStageId: 'maceration',
    stageDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stageNotes: 'Cold maceration at 19°C. Day 20 of 30. Ready for fine paper filtration soon.',
    notes: 'Brewed with prime cold-pressed Bergamot. Resting in climate-controlled dark box.'
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
    status: 'bottled',
    currentStageId: 'stocked',
    stageNotes: '10 flacons bottled, labeled, and placed in active inventory.',
    notes: '36 days maturation completed! Mellow sandalwood dry-down achieved.'
  },
  {
    id: 'batch-5',
    batchNumber: 'Batch #05',
    recipeId: 'rec-3',
    recipeName: 'Solstice Smoke & Vetiver',
    brewDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    targetDays: 28,
    bottlesPlanned: 12,
    bottlesBottled: 0,
    status: 'macerating',
    currentStageId: 'dilution',
    stageDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stageNotes: 'ENA alcohol added, chilled to 4°C, moving to 28-day dark maturation tomorrow.',
    notes: 'Experimental smoky birch blend.'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-101',
    customerName: 'Rohan Sharma',
    customerPhone: '+91 98765 43210',
    deliveryNote: 'Apartment 402, Indiranagar, Bengaluru',
    orderType: 'full_bottle',
    recipeId: 'rec-1',
    recipeName: 'Golden Amber & Bergamot',
    bottleSerial: 'Bottle 04 of 10',
    price: 2899.00,
    paymentMethod: 'UPI',
    status: 'Pending Payment',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-102',
    customerName: 'Priya Nair',
    customerPhone: '+91 98111 22334',
    deliveryNote: 'Deliver to Tech Park Gate 2, Gurgaon',
    orderType: 'full_bottle',
    recipeId: 'rec-2',
    recipeName: 'Velvet Santal & Rose',
    bottleSerial: 'Bottle 02 of 10',
    price: 3299.00,
    paymentMethod: 'UPI',
    status: 'Paid',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-103',
    customerName: 'Aarav Deshmukh',
    customerPhone: '+91 99201 12233',
    deliveryNote: 'Koregaon Park, Pune',
    orderType: 'discovery_set',
    recipeId: 'discovery',
    recipeName: 'Discovery Sampler Box (3 × 5ml)',
    discoveryItems: ['Golden Amber & Bergamot', 'Velvet Santal & Rose', 'Solstice Smoke & Vetiver'],
    bottleSerial: 'Discovery Box #06',
    price: 899.00,
    paymentMethod: 'UPI',
    status: 'Paid',
    createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString()
  }
];
