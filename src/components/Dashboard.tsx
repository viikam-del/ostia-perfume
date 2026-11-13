import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  TrendingUp,
  IndianRupee,
  Hourglass,
  Package,
  FlaskConical,
  ReceiptText,
  Layers,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Check
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    profile,
    recipes,
    batches,
    orders,
    materials,
    productionStages,
    setActiveTab,
    setViewMode,
    calculateRecipeCogs,
    updateOrderStatus
  } = useApp();

  // ---------------------------------------------------------------------------
  // 1. FINANCIAL TELEMETRY
  // ---------------------------------------------------------------------------
  const paidOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Delivered');
  const pendingOrders = orders.filter(o => o.status === 'Pending Payment');

  const realizedRevenue = paidOrders.reduce((sum, o) => sum + o.price, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.price, 0);

  // Calculate COGS of paid orders to get real gross profit
  const totalCogsPaid = paidOrders.reduce((sum, o) => {
    if (o.orderType === 'discovery_set') {
      // 3 × 5ml vials + luxury linen slide box + ~15ml perfume oil
      return sum + 285;
    }
    const recipe = recipes.find(r => r.id === o.recipeId);
    if (recipe) {
      const cogs = calculateRecipeCogs(recipe);
      return sum + (cogs.totalCogs || 380);
    }
    return sum + 380;
  }, 0);

  const realizedProfit = Math.max(0, realizedRevenue - totalCogsPaid);
  const realizedMargin = realizedRevenue > 0 ? Math.round((realizedProfit / realizedRevenue) * 100) : 0;

  // Total finished stock valuation (retail price × in-stock count)
  const totalStockBottles = recipes.reduce((sum, r) => sum + r.inStockBottles, 0);
  const totalStockRetailValue = recipes.reduce((sum, r) => sum + (r.inStockBottles * r.manualPrice), 0);

  // Raw materials inventory valuation
  const totalMaterialsValue = materials.reduce((sum, m) => sum + (m.stockQty * m.costPerUnit), 0);

  // ---------------------------------------------------------------------------
  // 2. PRODUCTION & TARGET PIPELINE
  // ---------------------------------------------------------------------------
  const monthlyTargetBottles = 15;
  const bottlesSold = orders.filter(o => o.orderType !== 'discovery_set').length;
  const targetProgress = Math.min(100, Math.round((bottlesSold / monthlyTargetBottles) * 100));

  const activeBatches = batches.filter(b => b.currentStageId !== 'stocked');
  const readyToBottleBatches = batches.filter(b => b.status === 'ready_to_bottle');

  // Stage distribution
  const stageDistribution = productionStages.map(stage => {
    const count = batches.filter(b => b.currentStageId === stage.id).length;
    return {
      ...stage,
      count
    };
  });

  // ---------------------------------------------------------------------------
  // 3. CRITICAL ALERTS & ACTION REQUIRED
  // ---------------------------------------------------------------------------
  const alerts: { id: string; type: 'warning' | 'urgent' | 'info'; message: string; actionTab: 'aging' | 'orders' | 'inventory'; actionLabel: string }[] = [];

  // Low raw materials alerts
  materials.forEach(m => {
    if (m.stockQty <= m.reorderThreshold) {
      alerts.push({
        id: `mat-${m.id}`,
        type: 'warning',
        message: `Low Material: ${m.name} (${m.stockQty} ${m.unit} remaining, min: ${m.reorderThreshold})`,
        actionTab: 'inventory',
        actionLabel: 'Restock'
      });
    }
  });

  // Pending payments alert
  if (pendingOrders.length > 0) {
    alerts.push({
      id: 'pending-orders',
      type: 'urgent',
      message: `${pendingOrders.length} order(s) pending payment confirmation (₹${pendingRevenue.toLocaleString('en-IN')})`,
      actionTab: 'orders',
      actionLabel: 'Review Orders'
    });
  }

  // Ready to bottle alert
  if (readyToBottleBatches.length > 0) {
    alerts.push({
      id: 'ready-bottles',
      type: 'info',
      message: `${readyToBottleBatches.length} macerated batch(es) completed and ready for bottling`,
      actionTab: 'aging',
      actionLabel: 'Bottle Now'
    });
  }

  return (
    <div className="space-y-4 pb-20 font-mono">
      {/* Studio Header & Status */}
      <div className="bg-gradient-to-r from-[#121622] via-[#0f131d] to-[#0a0d14] border border-[#1e2536] rounded-3xl p-4.5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#080a0f] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img src="/ostia-logo.png" alt="OSTIA" className="w-10 h-10 object-contain filter drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Studio Command Center • Live Telemetry
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-white font-serif-luxury mt-0.5 tracking-tight">
                {profile.businessName} Atelier
              </h1>
              <p className="text-xs text-gray-400 font-sans">
                Master Perfumer: <strong className="text-amber-300 font-serif-luxury font-bold">{profile.perfumerName}</strong> • Micro-Batch Formulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode('storefront')}
              className="py-2 px-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Store</span>
            </button>
            <button
              onClick={() => setActiveTab('aging')}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Brew Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. FINANCIAL & SALES KPI GRID (4 METRIC TILES)                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Realized Revenue */}
        <div className="bg-[#10141e] border border-[#1e2536] p-3.5 rounded-2xl relative overflow-hidden group hover:border-[#2b354c] transition shadow-sm">
          <div className="flex justify-between items-start text-gray-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Realized Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
            ₹{realizedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5 truncate">
            {paidOrders.length} Paid • ₹{pendingRevenue.toLocaleString('en-IN')} Pending
          </div>
        </div>

        {/* Realized Profit & Margin */}
        <div className="bg-[#10141e] border border-[#1e2536] p-3.5 rounded-2xl relative overflow-hidden group hover:border-[#2b354c] transition shadow-sm">
          <div className="flex justify-between items-start text-gray-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Net Profit</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              {realizedMargin}%
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono">
            ₹{realizedProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Gross Margin Realized
          </div>
        </div>

        {/* Finished Bottled Stock */}
        <div className="bg-[#10141e] border border-[#1e2536] p-3.5 rounded-2xl relative overflow-hidden group hover:border-[#2b354c] transition shadow-sm">
          <div className="flex justify-between items-start text-gray-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Bottled Stock</span>
            <Package className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-cyan-300 font-mono">
            {totalStockBottles} Flacons
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5 truncate">
            Valued at ₹{totalStockRetailValue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Monthly Artisan Target */}
        <div className="bg-[#10141e] border border-[#1e2536] p-3.5 rounded-2xl relative overflow-hidden group hover:border-[#2b354c] transition shadow-sm">
          <div className="flex justify-between items-start text-gray-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Monthly Target</span>
            <span className="text-[9px] text-amber-400 font-bold">{targetProgress}%</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
            {bottlesSold} <span className="text-xs text-gray-400 font-normal">/ {monthlyTargetBottles} bottles</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#1b2230] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CRITICAL ALERTS & BOTTLENECK RADAR                         */}
      {/* ------------------------------------------------------------- */}
      {alerts.length > 0 && (
        <div className="bg-[#10141e] border border-amber-500/30 rounded-3xl p-4 space-y-2.5 shadow-md">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Studio Attention Required ({alerts.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className="p-2.5 rounded-xl bg-[#080a0f] border border-[#1e2536] flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'urgent' ? 'bg-rose-400 animate-ping' : alert.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  <span className="text-gray-300 truncate text-[11px] font-sans">{alert.message}</span>
                </div>
                <button
                  onClick={() => setActiveTab(alert.actionTab)}
                  className="px-2 py-1 rounded-lg bg-[#141a27] hover:bg-[#1f283a] text-amber-400 text-[10px] font-bold shrink-0 border border-amber-400/20 active:scale-95 transition"
                >
                  {alert.actionLabel} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PRODUCTION PIPELINE RADAR (7 STAGES LIVE VIEW)             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#10141e] border border-[#1e2536] rounded-3xl p-4.5 space-y-3.5 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Hourglass className="w-4 h-4 text-amber-400" />
              Live 7-Stage Production Pipeline
            </h2>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">
              {activeBatches.length} batch(es) currently maturing and progressing in studio
            </p>
          </div>
          <button
            onClick={() => setActiveTab('aging')}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition"
          >
            <span>Full Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stage distribution pills */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
          {stageDistribution.map(stage => {
            const hasBatches = stage.count > 0;
            return (
              <div
                key={stage.id}
                className={`p-2 rounded-xl border text-[10px] transition ${
                  hasBatches
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-sm'
                    : 'bg-[#080a0f] border-[#1e2536] text-gray-500'
                }`}
              >
                <span className="block text-[8px] uppercase tracking-wider text-gray-400 truncate">
                  {stage.name.split(' ')[0]}
                </span>
                <span className={`text-base font-extrabold font-mono mt-0.5 block ${hasBatches ? 'text-amber-400' : 'text-gray-600'}`}>
                  {stage.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Batches Mini-Feed */}
        {activeBatches.length > 0 ? (
          <div className="space-y-2 pt-1">
            {activeBatches.map(batch => {
              const currentStage = productionStages.find(s => s.id === batch.currentStageId);
              const brewTime = new Date(batch.brewDate).getTime();
              const now = Date.now();
              const daysPassed = Math.max(0, Math.floor((now - brewTime) / (1000 * 60 * 60 * 24)));
              const targetDays = batch.targetDays || 42;
              const macerationPercent = Math.min(100, Math.round((daysPassed / targetDays) * 100));

              return (
                <div
                  key={batch.id}
                  onClick={() => setActiveTab('aging')}
                  className="bg-[#080a0f] p-3 rounded-2xl border border-[#1e2536] hover:border-[#2f3950] transition cursor-pointer flex justify-between items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-xs truncate">{batch.batchNumber} • {batch.recipeName}</strong>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 truncate">
                        {currentStage?.name || batch.currentStageId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-sans">
                      <span>Aging: Day {daysPassed}/{targetDays}</span>
                      <span>•</span>
                      <span>{batch.bottlesPlanned} bottles planned</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-400">{macerationPercent}%</span>
                    <span className="text-[9px] text-gray-500 block">Matured</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#080a0f] rounded-2xl border border-dashed border-[#1e2536] text-xs text-gray-500">
            No active batches. Click "Brew Batch" to formulate a new perfume edition.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4 & 5. RESPONSIVE 2-COLUMN SAAS GRID: PORTFOLIO & ORDERS      */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Fragrance Portfolio & In-Stock Radar */}
        <div className="bg-[#10141e] border border-[#1e2536] rounded-3xl p-4.5 space-y-3.5 shadow-lg h-full">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                Fragrance Portfolio & Stock Health
              </h2>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Finished inventory ready for allocation and client dispatch
              </p>
            </div>
            <button
              onClick={() => setActiveTab('recipes')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition"
            >
              <span>Formulas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recipes.map(recipe => {
              const cogs = calculateRecipeCogs(recipe);
              const unitProfit = Math.max(0, recipe.manualPrice - cogs.totalCogs);
              const margin = Math.round((unitProfit / recipe.manualPrice) * 100);
              const inStock = recipe.inStockBottles;
              const soldCount = orders.filter(o => o.recipeId === recipe.id).length;

              return (
                <div
                  key={recipe.id}
                  className="bg-[#080a0f] p-3.5 rounded-2xl border border-[#1e2536] flex flex-col sm:flex-row justify-between sm:items-center gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-extrabold text-white font-serif-luxury">{recipe.name}</h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161c28] text-gray-300 border border-[#222a3d]">
                        {recipe.concentration}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 italic font-sans mt-0.5">
                      "{recipe.tagline}"
                    </p>
                    <div className="flex items-center gap-2.5 text-[10px] text-gray-500 mt-1 font-mono">
                      <span>COGS: ₹{Math.round(cogs.totalCogs)}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Profit: ₹{unitProfit.toLocaleString('en-IN')} ({margin}%)</span>
                      <span>•</span>
                      <span>{soldCount} Sold</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-between sm:items-end items-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1a2130]">
                    <div className="text-sm font-extrabold text-amber-400 font-mono">
                      ₹{recipe.manualPrice.toLocaleString('en-IN')}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      inStock > 2
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : inStock > 0
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                    }`}>
                      {inStock > 0 ? `${inStock} In Stock` : 'Sold Out'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders & Cashflow Feed */}
        <div className="bg-[#10141e] border border-[#1e2536] rounded-3xl p-4.5 space-y-3.5 shadow-lg h-full">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ReceiptText className="w-4 h-4 text-amber-400" />
                Recent Orders & Cashflow
              </h2>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Live customer reservations from the storefront
              </p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition"
            >
              <span>All Orders ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 4).map(order => (
                <div
                  key={order.id}
                  className="bg-[#080a0f] p-3 rounded-2xl border border-[#1e2536] flex justify-between items-center gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 font-mono">{order.orderNumber}</span>
                      <span className="text-gray-200 font-bold truncate">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans mt-0.5 truncate">
                      <span className="truncate">{order.recipeName}</span>
                      <span>•</span>
                      <span className="font-mono text-gray-500">{order.bottleSerial}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-bold text-emerald-400 font-mono text-xs">
                      ₹{order.price.toLocaleString('en-IN')}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold block ${
                      order.status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : order.status === 'Delivered'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#080a0f] rounded-2xl border border-dashed border-[#1e2536] text-xs text-gray-500">
              No orders logged yet. Customer orders from the storefront will appear here.
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6 & 7. RESPONSIVE 2-COLUMN SAAS GRID: INVENTORY & LAUNCHPAD   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Raw Materials & Packaging Health (2 cols on lg) */}
        <div className="lg:col-span-2 bg-[#10141e] border border-[#1e2536] rounded-3xl p-4.5 space-y-3.5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Studio Inventory Health & Valuation
                </h2>
                <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                  Stock reserve of perfumer alcohol, glass flacons, pumps, and boxes
                </p>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition"
              >
                <span>Materials</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {materials.slice(0, 4).map(m => (
                <div key={m.id} className="bg-[#080a0f] p-2.5 rounded-xl border border-[#1e2536]">
                  <span className="text-[9px] text-gray-500 uppercase block font-bold truncate">{m.name}</span>
                  <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
                    {m.stockQty} <span className="text-[10px] text-gray-400 font-normal">{m.unit}</span>
                  </span>
                  <span className={`text-[8px] font-bold block mt-0.5 ${
                    m.stockQty <= m.reorderThreshold ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {m.stockQty <= m.reorderThreshold ? '⚠️ Low Stock' : '✓ Normal Reserve'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#080a0f] border border-[#1e2536] flex justify-between items-center text-xs mt-3">
            <span className="text-gray-400">Total Aroma & Packaging Asset Value:</span>
            <strong className="text-amber-300 font-mono text-sm">₹{Math.round(totalMaterialsValue).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Quick Studio Launchpad (1 col on lg) */}
        <div className="bg-[#10141e] border border-[#1e2536] rounded-3xl p-4.5 space-y-3 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Studio Launchpad
            </h2>
            <p className="text-[11px] text-gray-400 font-sans mb-3">
              Direct access to core formulation & commercial labs
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('recipes')}
              className="w-full p-2.5 rounded-xl bg-[#080a0f] hover:bg-[#121724] border border-[#1e2536] hover:border-amber-500/30 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                <span className="text-xs text-gray-200 font-bold">Formulation Studio</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition" />
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className="w-full p-2.5 rounded-xl bg-[#080a0f] hover:bg-[#121724] border border-[#1e2536] hover:border-emerald-500/30 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                <span className="text-xs text-gray-200 font-bold">Pricing & Margin Lab</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition" />
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="w-full p-2.5 rounded-xl bg-[#080a0f] hover:bg-[#121724] border border-[#1e2536] hover:border-cyan-500/30 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <ReceiptText className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                <span className="text-xs text-gray-200 font-bold">Orders & Dispatches</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400 transition" />
            </button>
          </div>

          <div className="text-[10px] text-gray-500 text-center pt-1 font-sans">
            Press <kbd className="px-1 py-0.5 rounded bg-[#080a0f] border border-[#1e2536] text-[9px] text-gray-400 font-mono">⌘K</kbd> for command palette
          </div>
        </div>
      </div>
    </div>
  );
};
