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
  Sparkles,
  ArrowUpRight,
  Target,
  CheckCircle2,
  Sun,
  Moon
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
    calculateRecipeCogs,
    theme,
    toggleTheme
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
    if (m.stockQty <= (m.reorderPoint ?? 25)) {
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
    <div className="space-y-4 select-none">
      {/* ------------------------------------------------------------- */}
      {/* STUDIO HERO CARD (Artisan Master Status)                      */}
      {/* ------------------------------------------------------------- */}
      <div className="card-luxury rounded-3xl p-4 relative overflow-hidden">
        {/* Ambient Top Glow within card */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-500/20 via-orange-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-[#17130e] border border-amber-500/35 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <img src="/ostia-logo.png" alt="OSTIA" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#120f0c] animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Studio Live
                </span>
              </div>
              <h1 className="text-base font-extrabold text-white font-serif-luxury truncate mt-1 tracking-wide uppercase">
                {profile.businessName} Atelier
              </h1>
              <p className="text-[11px] text-stone-300 font-sans truncate">
                Master Perfumer: <strong className="text-amber-300 font-serif-luxury">{profile.perfumerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Alabaster Light theme' : 'Switch to Noir Dark theme'}
              className={`p-2 rounded-2xl border transition active:scale-95 shadow-xs ${
                theme === 'dark'
                  ? 'bg-[#15110d] hover:bg-[#1d1712] text-amber-300 border-amber-500/25'
                  : 'bg-[#f4efe6] hover:bg-[#eae3d5] text-amber-700 border-amber-600/30'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-amber-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('aging')}
              className="btn-glow-amber py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Brew</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. FINANCIAL TELEMETRY (2x2 SYMMETRICAL SAAS GRID)           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Realized Revenue (Ref 1 Fintech Card Style) */}
        <div className="card-luxury p-3.5 rounded-3xl space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Total Balance</span>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          <div className="text-xl font-extrabold text-white font-mono tracking-tight">
            ₹{realizedRevenue.toLocaleString('en-IN')}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="badge-profit">
              <ArrowUpRight className="w-2.5 h-2.5" />
              <span>{paidOrders.length} Paid</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              ₹{pendingRevenue > 0 ? `+₹${pendingRevenue}` : '0 pend'}
            </span>
          </div>
        </div>

        {/* Realized Profit & Margin */}
        <div className="card-luxury p-3.5 rounded-3xl space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Net Profit</span>
            <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <IndianRupee className="w-3 h-3 text-amber-400" />
            </div>
          </div>

          <div className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
            ₹{realizedProfit.toLocaleString('en-IN')}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono">
              {realizedMargin}% Margin
            </span>
            <span className="text-[10px] text-stone-400 font-sans">
              Gross Realized
            </span>
          </div>
        </div>

        {/* Finished Bottled Stock */}
        <div className="card-luxury p-3.5 rounded-3xl space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Bottled Stock</span>
            <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Package className="w-3 h-3 text-orange-400" />
            </div>
          </div>

          <div className="text-xl font-extrabold text-white font-mono tracking-tight">
            {totalStockBottles} <span className="text-xs text-stone-400 font-sans font-normal">Bottles</span>
          </div>

          <div className="text-[10px] text-stone-400 truncate font-mono pt-0.5">
            Valued at <strong className="text-stone-300">₹{totalStockRetailValue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Monthly Artisan Target */}
        <div className="card-luxury p-3.5 rounded-3xl space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Month Goal</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {targetProgress}%
            </span>
          </div>

          <div className="text-xl font-extrabold text-white font-mono tracking-tight">
            {bottlesSold} <span className="text-xs text-stone-400 font-sans font-normal">/ {monthlyTargetBottles} sold</span>
          </div>

          <div className="w-full bg-[#201914] h-1.5 rounded-full overflow-hidden mt-1 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. ATTENTION REQUIRED ALERTS                                  */}
      {/* ------------------------------------------------------------- */}
      {alerts.length > 0 && (
        <div className="card-luxury rounded-3xl p-3.5 space-y-2.5 border-amber-500/30">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[10px] font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Action Items ({alerts.length})</span>
          </div>

          <div className="space-y-1.5">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className="p-2.5 rounded-2xl bg-[#14100d] border border-amber-500/15 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'urgent' ? 'bg-rose-500 animate-ping' : alert.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  <span className="text-stone-300 truncate text-[11px] font-sans">{alert.message}</span>
                </div>
                <button
                  onClick={() => setActiveTab(alert.actionTab)}
                  className="px-2.5 py-1 rounded-full bg-[#1e1711] hover:bg-[#281f17] text-amber-300 text-[10px] font-bold font-mono shrink-0 border border-amber-500/30 active:scale-95 transition"
                >
                  {alert.actionLabel} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. 7-STAGE PIPELINE RADAR (Ref 1 & 2 Horizontal Card Strip)   */}
      {/* ------------------------------------------------------------- */}
      <div className="card-luxury rounded-3xl p-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Hourglass className="w-3.5 h-3.5 text-amber-400" />
              7-Stage Production Track
            </h2>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">
              {activeBatches.length} batch(es) progressing in maturation
            </p>
          </div>
          <button
            onClick={() => setActiveTab('aging')}
            className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 hover:text-amber-300 transition font-mono"
          >
            <span>Timeline</span>
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
                className={`p-2.5 rounded-2xl border text-center shrink-0 w-24 transition-all ${
                  hasBatches
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#14100c] border-[#251e18] text-stone-500'
                }`}
              >
                <span className="block text-[8px] uppercase tracking-wider font-mono text-stone-400">
                  0{idx + 1} • {stage.shortCode}
                </span>
                <span className={`text-base font-black font-mono mt-0.5 block ${hasBatches ? 'text-amber-300' : 'text-stone-600'}`}>
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
                  className="bg-[#14100c] p-2.5 rounded-2xl border border-amber-500/15 flex justify-between items-center gap-2 cursor-pointer active:scale-98 hover:border-amber-500/30 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <strong className="text-white text-xs truncate">{batch.batchNumber} • {batch.recipeName}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5 font-sans">
                      <span className="text-amber-400 font-mono">{currentStage?.name || batch.currentStageId}</span>
                      <span>•</span>
                      <span className="font-mono">Day {daysPassed}/{targetDays}</span>
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
      {/* 4. FRAGRANCE PORTFOLIO & SIZING HEALTH                        */}
      {/* ------------------------------------------------------------- */}
      <div className="card-luxury rounded-3xl p-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              Artisan Formulas & Sizing
            </h2>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">
              Available sizes and atelier stock allocations
            </p>
          </div>
          <button
            onClick={() => setActiveTab('recipes')}
            className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 hover:text-amber-300 transition font-mono"
          >
            <span>Formulas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recipes.length === 0 ? (
            <div className="text-center py-6 bg-[#14100c] rounded-2xl border border-dashed border-[#282018] text-xs text-stone-500">
              No formulas created yet. Compose your first fragrance in the Formulas tab.
            </div>
          ) : (
            recipes.map(recipe => {
            const cogs = calculateRecipeCogs(recipe);
            const unitProfit = Math.max(0, recipe.manualPrice - cogs.totalCogs);
            const margin = Math.round((unitProfit / recipe.manualPrice) * 100);
            const inStock = recipe.inStockBottles;

            return (
              <div
                key={recipe.id}
                className="bg-[#14100c] p-3 rounded-2xl border border-amber-500/15 space-y-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-extrabold text-white font-serif-luxury truncate">{recipe.name}</h3>
                      <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-[#1d1712] text-amber-200 border border-amber-500/25 shrink-0 font-mono">
                        {recipe.concentration}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 italic font-sans truncate mt-0.5">
                      "{recipe.tagline}"
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-amber-300 font-mono">
                      ₹{recipe.manualPrice.toLocaleString('en-IN')}
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full inline-block mt-0.5 font-mono ${
                      inStock > 2
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : inStock > 0
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                    }`}>
                      {inStock > 0 ? `${inStock} Bottles Ready` : 'Sold Out'}
                    </span>
                  </div>
                </div>

                {/* Sizing options strip */}
                {recipe.sizes && recipe.sizes.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[9px] font-mono pt-1 border-t border-[#221b15]">
                    <span className="text-stone-500 uppercase font-bold shrink-0">Sizes:</span>
                    {recipe.sizes.map(s => (
                      <span key={s.sizeMl} className="px-2 py-0.5 rounded-full bg-[#18130f] text-stone-300 border border-amber-500/20 shrink-0 flex items-center gap-1">
                        <span>{s.sizeMl}ml</span>
                        <span className="text-amber-400 font-bold">({s.inStock})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Scent notes & economics summary */}
                <div className="pt-1.5 border-t border-[#221b15] flex justify-between items-center text-[10px] text-stone-400 font-mono">
                  <span>COGS: ₹{Math.round(cogs.totalCogs)}</span>
                  <span className="text-emerald-400 font-semibold">Profit: ₹{unitProfit.toLocaleString('en-IN')} ({margin}%)</span>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. RECENT ORDERS STREAM (Reference 1 Fintech Transaction Row) */}
      {/* ------------------------------------------------------------- */}
      <div className="card-luxury rounded-3xl p-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ReceiptText className="w-3.5 h-3.5 text-amber-400" />
              Recent Client Orders
            </h2>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">
              Live reservations and boutique purchases
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 hover:text-amber-300 transition font-mono"
          >
            <span>All ({orders.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-2">
            {orders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="bg-[#14100d] p-3 rounded-2xl border border-amber-500/15 flex justify-between items-center gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-2xl bg-[#1b1510] border border-amber-500/25 flex items-center justify-center font-bold text-amber-300 shrink-0 font-serif-luxury">
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-white font-bold truncate text-[11px]">{order.customerName}</span>
                      <span className="text-stone-500 text-[10px]">•</span>
                      <span className="text-amber-300 font-mono text-[10px]">{order.bottleSizeMl ? `${order.bottleSizeMl}ml` : '50ml'}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-sans truncate mt-0.5">
                      {order.recipeName} • {order.orderNumber}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-extrabold text-emerald-400 font-mono text-xs">
                    ₹{order.price.toLocaleString('en-IN')}
                  </div>
                  <span className={`px-2 py-0.2 rounded-full text-[8px] font-bold font-mono inline-block mt-0.5 ${
                    order.status === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : order.status === 'Delivered'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-[#14100d] rounded-2xl border border-dashed border-[#282018] text-xs text-stone-500">
            No orders logged yet.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. STUDIO QUICK LAUNCHPAD                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => setActiveTab('recipes')}
          className="p-3 rounded-2xl bg-[#14100d] hover:bg-[#1c1612] border border-amber-500/20 text-center active:scale-95 transition space-y-1 shadow-sm"
        >
          <FlaskConical className="w-5 h-5 text-amber-400 mx-auto" />
          <span className="text-[10px] text-stone-200 font-bold block">Formulas</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className="p-3 rounded-2xl bg-[#14100d] hover:bg-[#1c1612] border border-amber-500/20 text-center active:scale-95 transition space-y-1 shadow-sm"
        >
          <IndianRupee className="w-5 h-5 text-emerald-400 mx-auto" />
          <span className="text-[10px] text-stone-200 font-bold block">Pricing Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3 rounded-2xl bg-[#14100d] hover:bg-[#1c1612] border border-amber-500/20 text-center active:scale-95 transition space-y-1 shadow-sm"
        >
          <Layers className="w-5 h-5 text-orange-400 mx-auto" />
          <span className="text-[10px] text-stone-200 font-bold block">Stockroom</span>
        </button>
      </div>
    </div>
  );
};
