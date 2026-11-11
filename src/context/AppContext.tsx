import React, { createContext, useContext, useState, useEffect } from 'react';
import { RawMaterial, Recipe, Batch, Order, PerfumerProfile } from '../types';
import { initialMaterials, initialRecipes, initialBatches, initialOrders, initialProfile } from '../data/initialData';

interface AppContextType {
  profile: PerfumerProfile;
  materials: RawMaterial[];
  recipes: Recipe[];
  batches: Batch[];
  orders: Order[];
  viewMode: 'maker' | 'storefront';
  activeTab: 'pricing' | 'aging' | 'orders' | 'inventory';
  selectedRecipeId: string;
  setViewMode: (mode: 'maker' | 'storefront') => void;
  setActiveTab: (tab: 'pricing' | 'aging' | 'orders' | 'inventory') => void;
  setSelectedRecipeId: (id: string) => void;
  updateProfile: (profile: Partial<PerfumerProfile>) => void;
  updateRecipePrice: (recipeId: string, newPrice: number) => void;
  addRecipe: (recipe: Recipe) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatchStatus: (batchId: string, status: Batch['status']) => void;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentMethod?: Order['paymentMethod']) => void;
  updateMaterialStock: (materialId: string, delta: number) => void;
  addMaterial: (material: Omit<RawMaterial, 'id'>) => void;
  calculateRecipeCogs: (recipe: Recipe) => { oilCost: number; packCost: number; totalCogs: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PerfumerProfile>(() => {
    const saved = localStorage.getItem('ostia_v1_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [materials, setMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('ostia_v1_materials');
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('ostia_v1_recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('ostia_v1_batches');
    return saved ? JSON.parse(saved) : initialBatches;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ostia_v1_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [viewMode, setViewMode] = useState<'maker' | 'storefront'>('maker');
  const [activeTab, setActiveTab] = useState<'pricing' | 'aging' | 'orders' | 'inventory'>('pricing');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || 'rec-1');

  // Persistence effects
  useEffect(() => { localStorage.setItem('ostia_v1_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('ostia_v1_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('ostia_v1_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('ostia_v1_batches', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('ostia_v1_orders', JSON.stringify(orders)); }, [orders]);

  const updateProfile = (updates: Partial<PerfumerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateRecipePrice = (recipeId: string, newPrice: number) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, manualPrice: newPrice } : r));
  };

  const addRecipe = (recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  };

  const addBatch = (batchData: Omit<Batch, 'id'>) => {
    const newBatch: Batch = {
      ...batchData,
      id: 'batch-' + Date.now()
    };
    setBatches(prev => [newBatch, ...prev]);
  };

  const updateBatchStatus = (batchId: string, status: Batch['status']) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const updated = { ...b, status };
      // If marking bottled, increase recipe available bottles
      if (status === 'bottled' && b.status !== 'bottled') {
        setRecipes(rList => rList.map(r => r.id === b.recipeId ? { ...r, inStockBottles: r.inStockBottles + b.bottlesPlanned } : r));
      }
      return updated;
    }));
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

    // Deduct in stock bottle count
    setRecipes(prev => prev.map(r => {
      if (r.id === orderData.recipeId && r.inStockBottles > 0) {
        return { ...r, inStockBottles: r.inStockBottles - 1 };
      }
      return r;
    }));

    return orderNumber;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], paymentMethod?: Order['paymentMethod']) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status,
        ...(paymentMethod ? { paymentMethod } : {})
      };
    }));
  };

  const updateMaterialStock = (materialId: string, delta: number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      return { ...m, stockQty: Math.max(0, m.stockQty + delta) };
    }));
  };

  const addMaterial = (matData: Omit<RawMaterial, 'id'>) => {
    const newMat: RawMaterial = {
      ...matData,
      id: 'mat-' + Date.now()
    };
    setMaterials(prev => [...prev, newMat]);
  };

  const calculateRecipeCogs = (recipe: Recipe) => {
    // Liquid batch cost
    let totalBatchOilCost = 0;
    recipe.ingredients.forEach(ing => {
      const mat = materials.find(m => m.id === ing.materialId);
      const unitCost = mat ? mat.costPerUnit : 0;
      totalBatchOilCost += ing.amountGrams * unitCost;
    });

    const singleBottleOilCost = recipe.bottlesYield > 0 ? totalBatchOilCost / recipe.bottlesYield : 0;
    const packCost = recipe.bottleMaterialCost;
    const totalCogs = singleBottleOilCost + packCost;

    return {
      oilCost: singleBottleOilCost,
      packCost,
      totalCogs
    };
  };

  return (
    <AppContext.Provider value={{
      profile,
      materials,
      recipes,
      batches,
      orders,
      viewMode,
      activeTab,
      selectedRecipeId,
      setViewMode,
      setActiveTab,
      setSelectedRecipeId,
      updateProfile,
      updateRecipePrice,
      addRecipe,
      addBatch,
      updateBatchStatus,
      addOrder,
      updateOrderStatus,
      updateMaterialStock,
      addMaterial,
      calculateRecipeCogs
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
