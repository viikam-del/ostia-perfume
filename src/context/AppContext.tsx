import React, { createContext, useContext, useState, useEffect } from 'react';
import { RawMaterial, Recipe, Batch, Order, PerfumerProfile, DiscoveryConfig, ProductionStage, BottleSizeOption } from '../types';
import { initialMaterials, initialRecipes, initialBatches, initialOrders, initialProfile, initialDiscoveryConfig, defaultProductionStages, getDefaultRecipeSizes } from '../data/initialData';
import { supabase } from '../lib/supabase';

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
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  activeTab: ActiveTab;
  selectedRecipeId: string;
  tagModalBatch: Batch | null;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
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
  updateRecipeSizePrice: (recipeId: string, sizeMl: number, newPrice: number) => void;
  updateRecipeSizeStock: (recipeId: string, sizeMl: number, delta: number) => void;
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
  productionStats: {
    totalMadeAllTime: number;
    inProductionCount: number;
    finishedStockCount: number;
    bottlesSoldCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure legacy cached mock data is cleared for fresh clean slate
  if (typeof window !== 'undefined' && !localStorage.getItem('ostia_clean_slate_v1')) {
    localStorage.removeItem('ostia_v3_orders');
    localStorage.removeItem('ostia_v3_batches');
    localStorage.removeItem('ostia_v3_recipes');
    localStorage.removeItem('ostia_v3_materials');
    localStorage.setItem('ostia_clean_slate_v1', 'true');
  }

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  const [profile, setProfile] = useState<PerfumerProfile>(() => {
    const saved = localStorage.getItem('ostia_v3_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialProfile,
          ...parsed,
          businessName: 'OSTIA',
          perfumerName: 'Faisal Parvez',
          logoUrl: '/ostia-logo.png'
        };
      } catch (e) {
        return initialProfile;
      }
    }
    return initialProfile;
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Recipe[];
        return parsed.map(r => ({
          ...r,
          sizes: r.sizes && r.sizes.length > 0 ? r.sizes : getDefaultRecipeSizes(r.manualPrice)
        }));
      } catch (e) {
        return initialRecipes;
      }
    }
    return initialRecipes;
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
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ostia_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem('ostia_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

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

  // ---------------------------------------------------------------------------
  // SUPABASE CLOUD HYDRATION & REALTIME SUBSCRIPTION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const hydrateFromSupabase = async () => {
      try {
        setCloudSyncStatus('syncing');

        // 1. Fetch Orders
        const { data: dbOrders, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!orderErr && dbOrders && isMounted) {
          const mappedOrders: Order[] = dbOrders.map(row => ({
            id: row.id,
            orderNumber: row.order_number,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            recipeId: row.recipe_id,
            recipeName: row.recipe_name,
            bottleSerial: row.bottle_serial,
            bottleSizeMl: row.bottle_size_ml,
            bottleSizeLabel: row.bottle_size_label,
            price: Number(row.price),
            deliveryNote: row.delivery_note || '',
            orderType: row.order_type as any,
            discoveryItems: row.discovery_items,
            paymentMethod: row.payment_method as any,
            status: row.status as any,
            createdAt: row.created_at
          }));
          setOrders(mappedOrders);
        }

        // 2. Fetch Recipes
        const { data: dbRecipes, error: recErr } = await supabase
          .from('recipes')
          .select('*');

        if (!recErr && dbRecipes && isMounted) {
          const mappedRecipes: Recipe[] = dbRecipes.map(row => ({
            id: row.id,
            name: row.name,
            tagline: row.tagline || '',
            concentration: row.concentration || 'Extrait de Parfum (24%)',
            batchVolumeMl: row.batch_volume_ml || 500,
            maturationDaysNeeded: row.maturation_days_needed || 30,
            ingredients: row.ingredients || [],
            bottleMaterialCost: Number(row.bottle_material_cost) || 340,
            manualPrice: Number(row.manual_price) || 2899,
            bottlesYield: row.bottles_yield || 10,
            inStockBottles: row.in_stock_bottles || 0,
            pyramid: row.pyramid || { top: [], heart: [], base: [] },
            sizes: row.sizes && row.sizes.length > 0 ? row.sizes : getDefaultRecipeSizes(Number(row.manual_price) || 2899)
          }));
          setRecipes(mappedRecipes);
        }

        // 3. Fetch Batches
        const { data: dbBatches, error: batchErr } = await supabase
          .from('batches')
          .select('*')
          .order('created_at', { ascending: false });

        if (!batchErr && dbBatches && isMounted) {
          const mappedBatches: Batch[] = dbBatches.map(row => ({
            id: row.id,
            batchNumber: row.batch_number,
            recipeId: row.recipe_id,
            recipeName: row.recipe_name,
            brewDate: row.brew_date,
            targetDays: row.target_days,
            bottlesPlanned: row.bottles_planned,
            currentStageId: row.current_stage_id,
            status: row.status as any,
            stageNotes: row.stage_notes,
            notes: row.notes,
            bottlesBottled: row.status === 'bottled' ? row.bottles_planned : 0
          }));
          setBatches(mappedBatches);
        }

        // 4. Fetch Materials
        const { data: dbMaterials, error: matErr } = await supabase
          .from('materials')
          .select('*');

        if (!matErr && dbMaterials && isMounted) {
          const mappedMaterials: RawMaterial[] = dbMaterials.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category as any,
            unit: row.unit as any,
            costPerUnit: Number(row.cost_per_unit),
            stockQty: Number(row.stock_qty),
            reorderPoint: Number(row.reorder_point),
            supplier: row.supplier
          }));
          setMaterials(mappedMaterials);
        }

        if (isMounted) setCloudSyncStatus('synced');
      } catch (e) {
        console.warn('Supabase initial fetch fallback to local cache:', e);
        if (isMounted) setCloudSyncStatus('offline');
      }
    };

    hydrateFromSupabase();

    // Setup Supabase Realtime Channels for Live Cross-Device Sync
    const channel = supabase
      .channel('ostia-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            const newOrder: Order = {
              id: row.id,
              orderNumber: row.order_number,
              customerName: row.customer_name,
              customerPhone: row.customer_phone,
              recipeId: row.recipe_id,
              recipeName: row.recipe_name,
              bottleSerial: row.bottle_serial,
              bottleSizeMl: row.bottle_size_ml,
              bottleSizeLabel: row.bottle_size_label,
              price: Number(row.price),
              deliveryNote: row.delivery_note || '',
              orderType: row.order_type as any,
              discoveryItems: row.discovery_items,
              paymentMethod: row.payment_method as any,
              status: row.status as any,
              createdAt: row.created_at
            };
            setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            setOrders(prev => prev.map(o => o.id === row.id ? {
              ...o,
              status: row.status,
              paymentMethod: row.payment_method
            } : o));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'recipes' },
        (payload) => {
          const row = payload.new;
          setRecipes(prev => prev.map(r => r.id === row.id ? {
            ...r,
            manualPrice: Number(row.manual_price),
            inStockBottles: row.in_stock_bottles,
            sizes: row.sizes
          } : r));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

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
    let updatedBatch: Batch | null = null;

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

      let status = b.status;
      if (nextStageId === 'stocked') {
        status = 'bottled';
      } else if (nextStageId === 'bottling' || nextStageId === 'filtration') {
        status = 'ready_to_bottle';
      }

      const typicalDays = nextStage?.typicalDays || 1;
      const nextDue = new Date(Date.now() + typicalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res: Batch = {
        ...b,
        currentStageId: nextStageId,
        status,
        stageDueDate: nextDue,
        stageNotes: notes || b.stageNotes,
        stageHistory: updatedHistory
      };
      updatedBatch = res;
      return res;
    }));

    if (updatedBatch) {
      supabase.from('batches').update({
        current_stage_id: nextStageId,
        status: (updatedBatch as Batch).status,
        stage_notes: notes || (updatedBatch as Batch).stageNotes
      }).eq('id', batchId).then();
    }

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
    let updatedSizes: BottleSizeOption[] = [];
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      const currentSizes = r.sizes || getDefaultRecipeSizes(newPrice);
      updatedSizes = currentSizes.map(s => s.sizeMl === 50 ? { ...s, price: newPrice } : s);
      return { ...r, manualPrice: newPrice, sizes: updatedSizes };
    }));

    supabase.from('recipes').update({
      manual_price: newPrice,
      sizes: updatedSizes
    }).eq('id', recipeId).then();
  };

  const updateRecipeSizePrice = (recipeId: string, sizeMl: number, newPrice: number) => {
    let updatedSizes: BottleSizeOption[] = [];
    let updated50Price = 0;
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      const currentSizes = r.sizes || getDefaultRecipeSizes(r.manualPrice);
      updatedSizes = currentSizes.map(s => s.sizeMl === sizeMl ? { ...s, price: newPrice } : s);
      const is50 = sizeMl === 50;
      updated50Price = is50 ? newPrice : r.manualPrice;
      return {
        ...r,
        manualPrice: updated50Price,
        sizes: updatedSizes
      };
    }));

    supabase.from('recipes').update({
      manual_price: updated50Price,
      sizes: updatedSizes
    }).eq('id', recipeId).then();
  };

  const updateRecipeSizeStock = (recipeId: string, sizeMl: number, delta: number) => {
    let totalStock = 0;
    let updatedSizes: BottleSizeOption[] = [];
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      const currentSizes = r.sizes || getDefaultRecipeSizes(r.manualPrice);
      updatedSizes = currentSizes.map(s => s.sizeMl === sizeMl ? { ...s, inStock: Math.max(0, s.inStock + delta) } : s);
      totalStock = updatedSizes.reduce((sum, s) => sum + s.inStock, 0);
      return {
        ...r,
        inStockBottles: totalStock,
        sizes: updatedSizes
      };
    }));

    supabase.from('recipes').update({
      in_stock_bottles: totalStock,
      sizes: updatedSizes
    }).eq('id', recipeId).then();
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'inStockBottles'>) => {
    const basePrice = recipeData.manualPrice || 2899;
    const sizes = recipeData.sizes || getDefaultRecipeSizes(basePrice);
    const totalInStock = sizes.reduce((sum, s) => sum + s.inStock, 0);

    const newRecipe: Recipe = {
      ...recipeData,
      id: 'rec-' + Date.now(),
      manualPrice: basePrice,
      inStockBottles: totalInStock,
      sizes,
      createdAt: new Date().toISOString()
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setSelectedRecipeId(newRecipe.id);

    supabase.from('recipes').insert({
      id: newRecipe.id,
      name: newRecipe.name,
      tagline: newRecipe.tagline,
      concentration: newRecipe.concentration,
      batch_volume_ml: newRecipe.batchVolumeMl,
      maturation_days_needed: newRecipe.maturationDaysNeeded,
      ingredients: newRecipe.ingredients,
      bottle_material_cost: newRecipe.bottleMaterialCost,
      manual_price: newRecipe.manualPrice,
      bottles_yield: newRecipe.bottlesYield,
      in_stock_bottles: newRecipe.inStockBottles,
      pyramid: newRecipe.pyramid,
      sizes: newRecipe.sizes
    }).then();
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
    supabase.from('recipes').delete().eq('id', recipeId).then();
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

    supabase.from('batches').insert({
      id: newBatch.id,
      batch_number: newBatch.batchNumber,
      recipe_id: newBatch.recipeId,
      recipe_name: newBatch.recipeName,
      brew_date: newBatch.brewDate,
      target_days: newBatch.targetDays,
      bottles_planned: newBatch.bottlesPlanned,
      current_stage_id: newBatch.currentStageId,
      status: newBatch.status,
      notes: newBatch.notes
    }).then();

    return {
      success: true,
      message: `Batch "${batchData.batchNumber}" initiated at Stage 1! Formula materials deducted.`
    };
  };

  const updateBatchStatus = (batchId: string, status: Batch['status']) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status } : b));
    supabase.from('batches').update({ status }).eq('id', batchId).then();
  };

  const bottleBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return { success: false, message: 'Batch not found.' };

    const count = batch.bottlesPlanned;

    setMaterials(prev => prev.map(mat => {
      if (mat.id === 'mat-8' || mat.id === 'mat-9' || mat.id === 'mat-10' || mat.id === 'mat-11') {
        return { ...mat, stockQty: Math.max(0, mat.stockQty - count) };
      }
      return mat;
    }));

    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: 'bottled', currentStageId: 'stocked', bottlesBottled: count } : b));
    setRecipes(prev => prev.map(r => r.id === batch.recipeId ? { ...r, inStockBottles: r.inStockBottles + count } : r));

    supabase.from('batches').update({ status: 'bottled', current_stage_id: 'stocked' }).eq('id', batchId).then();
    const currentRec = recipes.find(r => r.id === batch.recipeId);
    if (currentRec) {
      supabase.from('recipes').update({ in_stock_bottles: currentRec.inStockBottles + count }).eq('id', batch.recipeId).then();
    }

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
        if (r.id === orderData.recipeId) {
          const sizeMl = orderData.bottleSizeMl || 50;
          const currentSizes = r.sizes || getDefaultRecipeSizes(r.manualPrice);
          const updatedSizes = currentSizes.map(s => s.sizeMl === sizeMl ? { ...s, inStock: Math.max(0, s.inStock - 1) } : s);
          const newTotalStock = Math.max(0, r.inStockBottles - 1);
          
          supabase.from('recipes').update({
            in_stock_bottles: newTotalStock,
            sizes: updatedSizes
          }).eq('id', r.id).then();

          return {
            ...r,
            inStockBottles: newTotalStock,
            sizes: updatedSizes
          };
        }
        return r;
      }));
    }

    // Persist order to Supabase
    supabase.from('orders').insert({
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      customer_name: newOrder.customerName,
      customer_phone: newOrder.customerPhone,
      recipe_id: newOrder.recipeId,
      recipe_name: newOrder.recipeName,
      bottle_serial: newOrder.bottleSerial,
      bottle_size_ml: newOrder.bottleSizeMl,
      bottle_size_label: newOrder.bottleSizeLabel,
      price: newOrder.price,
      delivery_note: newOrder.deliveryNote,
      order_type: newOrder.orderType,
      discovery_items: newOrder.discoveryItems,
      payment_method: newOrder.paymentMethod,
      status: newOrder.status,
      created_at: newOrder.createdAt
    }).then();

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], paymentMethod?: Order['paymentMethod']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, ...(paymentMethod ? { paymentMethod } : {}) } : o));

    supabase.from('orders').update({
      status,
      ...(paymentMethod ? { payment_method: paymentMethod } : {})
    }).eq('id', orderId).then();
  };

  const updateMaterialStock = (materialId: string, delta: number) => {
    let newQty = 0;
    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        newQty = Math.max(0, m.stockQty + delta);
        return { ...m, stockQty: newQty };
      }
      return m;
    }));

    supabase.from('materials').update({ stock_qty: newQty }).eq('id', materialId).then();
  };

  const addMaterial = (matData: Omit<RawMaterial, 'id'>) => {
    const newMat: RawMaterial = { ...matData, id: 'mat-' + Date.now() };
    setMaterials(prev => [...prev, newMat]);

    supabase.from('materials').insert({
      id: newMat.id,
      name: newMat.name,
      category: newMat.category,
      unit: newMat.unit,
      cost_per_unit: newMat.costPerUnit,
      stock_qty: newMat.stockQty,
      reorder_point: newMat.reorderPoint,
      supplier: newMat.supplier
    }).then();
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
      theme,
      setTheme,
      toggleTheme,
      activeTab,
      selectedRecipeId,
      tagModalBatch,
      cloudSyncStatus,
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
      updateRecipeSizePrice,
      updateRecipeSizeStock,
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
