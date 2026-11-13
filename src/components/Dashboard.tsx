import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Hourglass,
  Package,
  FlaskConical,
  ReceiptText,
  Layers,
  ChevronRight,
  AlertCircle,
  IndianRupee,
  Plus,
  Sparkles
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
    calculateRecipeCogs
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

  // Total finished stock valuation
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
  // 3. CRITICAL ALERTS
  // ---------------------------------------------------------------------------
  const alerts: { id: string; type: 'warning' | 'urgent' | 'info'; message: string; actionTab: 'aging' | 'orders' | 'inventory'; actionLabel: string }[] = [];

  materials.forEach(m => {
    if (m.stockQty <= m.reorderThreshold) {
      alerts.push({
        id: `mat-${m.id}`,
        type: 'warning',
        message: `Low Stock: ${m.name} (${m.stockQty} ${m.unit} left)`,
        actionTab: 'inventory',
        actionLabel: 'Restock'
      });
    }
  });

  if (pendingOrders.length > 0) {
    alerts.push({
      id: 'pending-orders',
      type: 'urgent',
      message: `${pendingOrders.length} order(s) awaiting payment (₹${pendingRevenue.toLocaleString('en-IN')})`,
      actionTab: 'orders',
      actionLabel: 'Verify'
    });
  }

  if (readyToBottleBatches.length > 0) {
    alerts.push({
      id: 'ready-bottles',
      type: 'info',
      message: `${readyToBottleBatches.length} batch(es) completed cold maceration`,
      actionTab: 'aging',
      actionLabel: 'Bottle'
    });
  }

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Studio Header Card */}
      <div className="bg-[#0f1422] border border-[#1a2336] rounded-3xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#080b12] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-md">
            <img src="/ostia-logo.png" alt="OSTIA" className="w-10 h-10 object-contain filter drop-shadow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Studio Active
              </span>
            </div>
            <h1 className="text-base font-extrabold text-white font-serif-luxury truncate mt-0.5 tracking-wide uppercase">
              {profile.businessName} Atelier
            </h1>
            <p className="text-[11px] text-gray-400 font-sans truncate">
              Perfumer: <strong className="text-amber-300 font-serif-luxury">{profile.perfumerName}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('aging')}
          className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Brew</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. FINANCIAL TELEMETRY (2x2 SYMMETRICAL MOBILE GRID)          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Realized Revenue */}
        <div className="bg-[#0f1422] border border-[#1a2336] p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            ₹{realizedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 truncate font-sans">
            {paidOrders.length} settled orders
          </div>
        </div>

        {/* Realized Profit & Margin */}
        <div className="bg-[#0f1422] border border-[#1a2336] p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Net Profit</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              {realizedMargin}%
            </span>
          </div>
          <div className="text-lg font-black text-amber-300 font-mono">
            ₹{realizedProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 truncate font-sans">
            Realized gross margin
          </div>
        </div>

        {/* Finished Bottled Stock */}
        <div className="bg-[#0f1422] border border-[#1a2336] p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Bottled Stock</span>
            <Package className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-black text-cyan-300 font-mono">
            {totalStockBottles} Flacons
          </div>
          <div className="text-[10px] text-gray-400 truncate font-sans">
            Valued at ₹{totalStockRetailValue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Monthly Artisan Target */}
        <div className="bg-[#0f1422] border border-[#1a2336] p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Month Goal</span>
            <span className="text-[9px] text-amber-400 font-bold">{targetProgress}%</span>
          </div>
          <div className="text-lg font-black text-white font-mono">
            {bottlesSold} <span className="text-xs text-gray-400 font-normal">/ {monthlyTargetBottles}</span>
          </div>
          <div className="w-full bg-[#1b2336] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. ATTENTION REQUIRED ALERTS                                  */}
      {/* ------------------------------------------------------------- */}
      {alerts.length > 0 && (
        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-300 font-extrabold uppercase tracking-wider text-[10px]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Attention ({alerts.length})</span>
          </div>

          <div className="space-y-1.5">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className="p-2.5 rounded-xl bg-[#080b12] border border-[#1a2336] flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'urgent' ? 'bg-rose-400 animate-ping' : alert.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  <span className="text-gray-300 truncate text-[11px] font-sans">{alert.message}</span>
                </div>
                <button
                  onClick={() => setActiveTab(alert.actionTab)}
                  className="px-2 py-1 rounded-lg bg-[#141b2a] hover:bg-[#1e273c] text-amber-400 text-[10px] font-bold shrink-0 border border-amber-400/20 active:scale-95 transition"
                >
                  {alert.actionLabel} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. 7-STAGE PIPELINE RADAR (HORIZONTAL SCROLLING MOBILE TRACK) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0f1422] border border-[#1a2336] rounded-2xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-amber-400" />
              7-Stage Production Pipeline
            </h2>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">
              {activeBatches.length} batch(es) progressing in atelier
            </p>
          </div>
          <button
            onClick={() => setActiveTab('aging')}
            className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 transition"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Swipeable Stage Pills */}
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1 pt-0.5">
          {stageDistribution.map((stage, idx) => {
            const hasBatches = stage.count > 0;
            return (
              <div
                key={stage.id}
                className={`p-2.5 rounded-xl border text-center shrink-0 w-24 transition ${
                  hasBatches
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-[#080b12] border-[#1a2336] text-gray-500'
                }`}
              >
                <span className="block text-[8px] uppercase tracking-wider text-gray-400">
                  0{idx + 1} • {stage.shortCode}
                </span>
                <span className={`text-base font-black font-mono mt-0.5 block ${hasBatches ? 'text-amber-400' : 'text-gray-600'}`}>
                  {stage.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Batches Mini-Feed */}
        {activeBatches.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {activeBatches.slice(0, 2).map(batch => {
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
                  className="bg-[#080b12] p-2.5 rounded-xl border border-[#1a2336] flex justify-between items-center gap-2 cursor-pointer active:scale-98 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <strong className="text-white text-xs truncate">{batch.batchNumber} • {batch.recipeName}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 font-sans">
                      <span className="text-amber-400">{currentStage?.name || batch.currentStageId}</span>
                      <span>•</span>
                      <span>Day {daysPassed}/{targetDays}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-400">{macerationPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. FRAGRANCE PORTFOLIO & STOCK HEALTH                         */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0f1422] border border-[#1a2336] rounded-2xl p-3.5 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              Fragrance Portfolio & Stock
            </h2>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">
              Finished bottles ready for allocation
            </p>
          </div>
          <button
            onClick={() => setActiveTab('recipes')}
            className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 transition"
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

            return (
              <div
                key={recipe.id}
                className="bg-[#080b12] p-3 rounded-xl border border-[#1a2336] space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-extrabold text-white font-serif-luxury truncate">{recipe.name}</h3>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#141b2a] text-gray-300 border border-[#1e273c] shrink-0">
                        {recipe.concentration}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 italic font-sans truncate mt-0.5">
                      "{recipe.tagline}"
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-amber-400 font-mono">
                      ₹{recipe.manualPrice.toLocaleString('en-IN')}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
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

                {/* Available sizes */}
                {recipe.sizes && recipe.sizes.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[9px] font-mono pt-1 border-t border-[#141b2a]">
                    <span className="text-gray-500 uppercase font-bold shrink-0">Sizes:</span>
                    {recipe.sizes.map(s => (
                      <span key={s.sizeMl} className="px-1.5 py-0.2 rounded bg-[#10141e] text-gray-300 border border-[#1e2536] shrink-0">
                        {s.sizeMl}ml <span className="text-amber-400 font-bold">({s.inStock})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Scent notes summary */}
                <div className="pt-1.5 border-t border-[#141b2a] flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <span>COGS: ₹{Math.round(cogs.totalCogs)}</span>
                  <span className="text-emerald-400">Profit: ₹{unitProfit.toLocaleString('en-IN')} ({margin}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. RECENT ORDERS STREAM                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0f1422] border border-[#1a2336] rounded-2xl p-3.5 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ReceiptText className="w-3.5 h-3.5 text-amber-400" />
              Recent Client Orders
            </h2>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">
              Reservations from your online storefront
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 transition"
          >
            <span>Orders ({orders.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-1.5">
            {orders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="bg-[#080b12] p-2.5 rounded-xl border border-[#1a2336] flex justify-between items-center gap-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-amber-300 font-mono text-[11px]">{order.orderNumber}</span>
                    <span className="text-white font-bold truncate text-[11px]">{order.customerName}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans truncate mt-0.5">
                    {order.recipeName} • {order.bottleSerial}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-400 font-mono text-xs">
                    ₹{order.price.toLocaleString('en-IN')}
                  </div>
                  <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold inline-block mt-0.5 ${
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
          <div className="text-center py-6 bg-[#080b12] rounded-xl border border-dashed border-[#1a2336] text-xs text-gray-500">
            No orders logged yet.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. RAW MATERIALS & LAUNCHPAD                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => setActiveTab('recipes')}
          className="p-3 rounded-2xl bg-[#0f1422] hover:bg-[#141b2a] border border-[#1a2336] text-center active:scale-95 transition space-y-1 shadow-sm"
        >
          <FlaskConical className="w-5 h-5 text-amber-400 mx-auto" />
          <span className="text-[10px] text-gray-200 font-bold block">Formulas</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className="p-3 rounded-2xl bg-[#0f1422] hover:bg-[#141b2a] border border-[#1a2336] text-center active:scale-95 transition space-y-1 shadow-sm"
        >
          <IndianRupee className="w-5 h-5 text-emerald-400 mx-auto" />
          <span className="text-[10px] text-gray-200 font-bold block">Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3 rounded-2xl bg-[#0f1422] hover:bg-[#141b2a] border border-[#1a2336] text-center active:scale-95 transition space-y-1 shadow-sm"
        >
          <Layers className="w-5 h-5 text-cyan-400 mx-auto" />
          <span className="text-[10px] text-gray-200 font-bold block">Stock</span>
        </button>
      </div>
    </div>
  );
};
