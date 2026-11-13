import React, { createContext, useContext, useState, useEffect } from 'react';
import { RawMaterial, Recipe, Batch, Order, PerfumerProfile, DiscoveryConfig, ProductionStage } from '../types';
import { initialMaterials, initialRecipes, initialBatches, initialOrders, initialProfile, initialDiscoveryConfig, defaultProductionStages } from '../data/initialData';

export type ActiveTab = 'dashboard' | 'aging' | 'recipes' | 'pricing' | 'orders' | 'inventory';

interface AppContextType {
  profile: PerfumerProfile;
  materials: RawMaterial[];
  recipes: Recipe[];
  batches: Batch[];
  orders: Order[];
  discoveryConfig: DiscoveryConfig;
  productionStages: ProductionStage[];
  viewMode: 'maker' | 'storefront';
  activeTab: ActiveTab;
  selectedRecipeId: string;
  tagModalBatch: Batch | null;
  setTagModalBatch: (batch: Batch | null) => void;
  setViewMode: (mode: 'maker' | 'storefront') => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedRecipeId: (id: string) => void;
  updateProfile: (profile: Partial<PerfumerProfile>) => void;
  updateDiscoveryConfig: (updates: Partial<DiscoveryConfig>) => void;
  updateProductionStage: (stageId: string, updates: Partial<ProductionStage>) => void;
  advanceBatchStage: (batchId: string, nextStageId: string, notes?: string) => void;
  shareBatchReminder: (batchId: string) => Promise<{ text: string; shared: boolean }>;
  updateRecipePrice: (recipeId: string, newPrice: number) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'inStockBottles'>) => void;
  updateRecipe: (recipeId: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (recipeId: string) => void;
  scaleRecipe: (recipeId: string, targetVolumeMl: number) => void;
  brewBatch: (batchData: Omit<Batch, 'id' | 'status' | 'bottlesBottled'>) => { success: boolean; message: string };
  updateBatchStatus: (batchId: string, status: Batch['status']) => void;
  bottleBatch: (batchId: string) => { success: boolean; message: string };
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentMethod?: Order['paymentMethod']) => void;
  updateMaterialStock: (materialId: string, delta: number) => void;
  addMaterial: (material: Omit<RawMaterial, 'id'>) => void;
  calculateRecipeCogs: (recipe: Recipe) => {
    oilCost: number;
    packCost: number;
    totalCogs: number;
    concentrateGrams: number;
    carrierGrams: number;
    concentrationPercent: number;
  };
  // Production Telemetry
  productionStats: {
    totalMadeAllTime: number;
    inProductionCount: number;
    finishedStockCount: number;
    bottlesSoldCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PerfumerProfile>(() => {
    const saved = localStorage.getItem('ostia_v3_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [discoveryConfig, setDiscoveryConfig] = useState<DiscoveryConfig>(() => {
    const saved = localStorage.getItem('ostia_v3_discovery');
    return saved ? JSON.parse(saved) : initialDiscoveryConfig;
  });

  const [productionStages, setProductionStages] = useState<ProductionStage[]>(() => {
    const saved = localStorage.getItem('ostia_v3_stages');
    return saved ? JSON.parse(saved) : defaultProductionStages;
  });

  const [materials, setMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('ostia_v3_materials');
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('ostia_v3_recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('ostia_v3_batches');
    return saved ? JSON.parse(saved) : initialBatches;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ostia_v3_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [viewMode, setViewMode] = useState<'maker' | 'storefront'>('maker');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || 'rec-1');
  const [tagModalBatch, setTagModalBatch] = useState<Batch | null>(null);

  // Local storage synchronization
  useEffect(() => { localStorage.setItem('ostia_v3_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('ostia_v3_discovery', JSON.stringify(discoveryConfig)); }, [discoveryConfig]);
  useEffect(() => { localStorage.setItem('ostia_v3_stages', JSON.stringify(productionStages)); }, [productionStages]);
  useEffect(() => { localStorage.setItem('ostia_v3_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('ostia_v3_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('ostia_v3_batches', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('ostia_v3_orders', JSON.stringify(orders)); }, [orders]);

  const updateProfile = (updates: Partial<PerfumerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateDiscoveryConfig = (updates: Partial<DiscoveryConfig>) => {
    setDiscoveryConfig(prev => ({ ...prev, ...updates }));
  };

  const updateProductionStage = (stageId: string, updates: Partial<ProductionStage>) => {
    setProductionStages(prev => prev.map(s => s.id === stageId ? { ...s, ...updates } : s));
  };

  const advanceBatchStage = (batchId: string, nextStageId: string, notes?: string) => {
    const nextStage = productionStages.find(s => s.id === nextStageId);
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      
      const history = b.stageHistory || [];
      const updatedHistory = [
        ...history,
        {
          stageId: b.currentStageId,
          stageName: productionStages.find(s => s.id === b.currentStageId)?.name || b.currentStageId,
          completedAt: new Date().toISOString(),
          notes
        }
      ];

      // Auto-bottle if reaching stocked or bottling
      let status = b.status;
      if (nextStageId === 'stocked') {
        status = 'bottled';
      } else if (nextStageId === 'bottling' || nextStageId === 'filtration') {
        status = 'ready_to_bottle';
      }

      // Calculate next due date based on typicalDays
      const typicalDays = nextStage?.typicalDays || 1;
      const nextDue = new Date(Date.now() + typicalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        ...b,
        currentStageId: nextStageId,
        status,
        stageDueDate: nextDue,
        stageNotes: notes || b.stageNotes,
        stageHistory: updatedHistory
      };
    }));

    // If reaching stocked and wasn't previously bottled, deduct packaging and restock!
    if (nextStageId === 'stocked') {
      const b = batches.find(item => item.id === batchId);
      if (b && b.status !== 'bottled') {
        bottleBatch(batchId);
      }
    }
  };

  const shareBatchReminder = async (batchId: string) => {
    const b = batches.find(item => item.id === batchId);
    if (!b) return { text: '', shared: false };

    const stage = productionStages.find(s => s.id === b.currentStageId) || { name: b.currentStageId };
    const text = `🔔 Ostia Production Alert:\n${b.batchNumber} (${b.recipeName}) is currently at [Stage: ${stage.name}].\nTarget Due Date: ${b.stageDueDate || 'Action Required'}.\nBottles: ${b.bottlesPlanned} flacons (50ml).\nNotes: ${b.stageNotes || b.notes || 'Proceed to next check'}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ostia Batch Alert: ${b.batchNumber}`,
          text
        });
        return { text, shared: true };
      } catch (err) {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    return { text, shared: true };
  };

  const updateRecipePrice = (recipeId: string, newPrice: number) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, manualPrice: newPrice } : r));
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'inStockBottles'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: 'rec-' + Date.now(),
      inStockBottles: 0,
      createdAt: new Date().toISOString()
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setSelectedRecipeId(newRecipe.id);
  };

  const updateRecipe = (recipeId: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, ...updates } : r));
  };

  const deleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    if (selectedRecipeId === recipeId) {
      const remaining = recipes.filter(r => r.id !== recipeId);
      if (remaining.length > 0) setSelectedRecipeId(remaining[0].id);
    }
  };

  const scaleRecipe = (recipeId: string, targetVolumeMl: number) => {
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      const ratio = targetVolumeMl / (r.batchVolumeMl || 500);
      const scaledIngredients = r.ingredients.map(ing => ({
        ...ing,
        amountGrams: parseFloat((ing.amountGrams * ratio).toFixed(2))
      }));
      const newYield = Math.max(1, Math.round(targetVolumeMl / 50));
      return {
        ...r,
        batchVolumeMl: targetVolumeMl,
        bottlesYield: newYield,
        ingredients: scaledIngredients
      };
    }));
  };

  const brewBatch = (batchData: Omit<Batch, 'id' | 'status' | 'bottlesBottled'>) => {
    const recipe = recipes.find(r => r.id === batchData.recipeId);
    if (!recipe) return { success: false, message: 'Recipe not found.' };

    for (const ing of recipe.ingredients) {
      const mat = materials.find(m => m.id === ing.materialId);
      if (mat && mat.stockQty < ing.amountGrams) {
        return {
          success: false,
          message: `Insufficient stock for ${mat.name}. Needs ${ing.amountGrams}${mat.unit}, available: ${mat.stockQty}${mat.unit}.`
        };
      }
    }

    setMaterials(prev => prev.map(mat => {
      const ing = recipe.ingredients.find(i => i.materialId === mat.id);
      if (ing) {
        return { ...mat, stockQty: Math.max(0, parseFloat((mat.stockQty - ing.amountGrams).toFixed(2))) };
      }
      return mat;
    }));

    const newBatch: Batch = {
      ...batchData,
      id: 'batch-' + Date.now(),
      status: 'macerating',
      currentStageId: batchData.currentStageId || 'compounding',
      stageDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bottlesBottled: 0
    };
    setBatches(prev => [newBatch, ...prev]);

    return {
      success: true,
      message: `Batch "${batchData.batchNumber}" initiated at Stage 1! Formula materials deducted.`
    };
  };

  const updateBatchStatus = (batchId: string, status: Batch['status']) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status } : b));
  };

  const bottleBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return { success: false, message: 'Batch not found.' };

    const count = batch.bottlesPlanned;

    // Deduct standard 50ml packaging
    setMaterials(prev => prev.map(mat => {
      if (mat.id === 'mat-8' || mat.id === 'mat-9' || mat.id === 'mat-10' || mat.id === 'mat-11') {
        return { ...mat, stockQty: Math.max(0, mat.stockQty - count) };
      }
      return mat;
    }));

    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: 'bottled', currentStageId: 'stocked', bottlesBottled: count } : b));
    setRecipes(prev => prev.map(r => r.id === batch.recipeId ? { ...r, inStockBottles: r.inStockBottles + count } : r));

    return {
      success: true,
      message: `Successfully bottled ${count} flacons of ${batch.recipeName}! Finished stock updated.`
    };
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const count = orders.length + 1;
    const orderNumber = `ORD-${String(count).padStart(3, '0')}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);

    if (orderData.orderType === 'discovery_set') {
      setMaterials(prev => prev.map(mat => {
        if (mat.id === 'mat-12') return { ...mat, stockQty: Math.max(0, mat.stockQty - 3) };
        if (mat.id === 'mat-13') return { ...mat, stockQty: Math.max(0, mat.stockQty - 1) };
        return mat;
      }));
    } else {
      setRecipes(prev => prev.map(r => {
        if (r.id === orderData.recipeId && r.inStockBottles > 0) {
          return { ...r, inStockBottles: r.inStockBottles - 1 };
        }
        return r;
      }));
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], paymentMethod?: Order['paymentMethod']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, ...(paymentMethod ? { paymentMethod } : {}) } : o));
  };

  const updateMaterialStock = (materialId: string, delta: number) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, stockQty: Math.max(0, m.stockQty + delta) } : m));
  };

  const addMaterial = (matData: Omit<RawMaterial, 'id'>) => {
    const newMat: RawMaterial = { ...matData, id: 'mat-' + Date.now() };
    setMaterials(prev => [...prev, newMat]);
  };

  const calculateRecipeCogs = (recipe: Recipe) => {
    let totalBatchOilCost = 0;
    let concentrateGrams = 0;
    let carrierGrams = 0;

    recipe.ingredients.forEach(ing => {
      const mat = materials.find(m => m.id === ing.materialId);
      const unitCost = mat ? mat.costPerUnit : 0;
      totalBatchOilCost += ing.amountGrams * unitCost;

      if (ing.noteType === 'carrier') {
        carrierGrams += ing.amountGrams;
      } else {
        concentrateGrams += ing.amountGrams;
      }
    });

    const totalWeight = concentrateGrams + carrierGrams;
    const concentrationPercent = totalWeight > 0 ? (concentrateGrams / totalWeight) * 100 : 0;

    const bottles = recipe.bottlesYield || 10;
    const singleBottleOilCost = bottles > 0 ? totalBatchOilCost / bottles : 0;
    const packCost = recipe.bottleMaterialCost || 340;
    const totalCogs = singleBottleOilCost + packCost;

    return {
      oilCost: singleBottleOilCost,
      packCost,
      totalCogs,
      concentrateGrams,
      carrierGrams,
      concentrationPercent
    };
  };

  // Production Telemetry
  const totalMadeAllTime = batches.reduce((sum, b) => sum + (b.bottlesBottled || 0), 0);
  const inProductionCount = batches
    .filter(b => b.currentStageId !== 'stocked')
    .reduce((sum, b) => sum + b.bottlesPlanned, 0);
  const finishedStockCount = recipes.reduce((sum, r) => sum + r.inStockBottles, 0);
  const bottlesSoldCount = orders.filter(o => o.orderType !== 'discovery_set').length;

  return (
    <AppContext.Provider value={{
      profile,
      materials,
      recipes,
      batches,
      orders,
      discoveryConfig,
      productionStages,
      viewMode,
      activeTab,
      selectedRecipeId,
      tagModalBatch,
      setTagModalBatch,
      setViewMode,
      setActiveTab,
      setSelectedRecipeId,
      updateProfile,
      updateDiscoveryConfig,
      updateProductionStage,
      advanceBatchStage,
      shareBatchReminder,
      updateRecipePrice,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      scaleRecipe,
      brewBatch,
      updateBatchStatus,
      bottleBatch,
      addOrder,
      updateOrderStatus,
      updateMaterialStock,
      addMaterial,
      calculateRecipeCogs,
      productionStats: {
        totalMadeAllTime,
        inProductionCount,
        finishedStockCount,
        bottlesSoldCount
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
