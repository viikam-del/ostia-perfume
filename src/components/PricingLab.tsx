import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDefaultRecipeSizes } from '../data/initialData';
import { TrendingUp, Percent, Info, Check, Sparkles, Box, Layers, IndianRupee } from 'lucide-react';

export const PricingLab: React.FC = () => {
  const {
    recipes,
    selectedRecipeId,
    setSelectedRecipeId,
    updateRecipePrice,
    updateRecipeSizePrice,
    calculateRecipeCogs,
    profile,
    discoveryConfig,
    updateDiscoveryConfig
  } = useApp();
  const [saveToast, setSaveToast] = useState(false);

  const currentRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];
  const { oilCost, packCost, totalCogs, concentrationPercent } = currentRecipe
    ? calculateRecipeCogs(currentRecipe)
    : { oilCost: 0, packCost: 0, totalCogs: 0, concentrationPercent: 0 };

  const currentPrice = currentRecipe?.manualPrice || 0;
  const netProfit = currentPrice - totalCogs;
  const marginPercent = currentPrice > 0 ? (netProfit / currentPrice) * 100 : 0;

  // Recipe sizes
  const recipeSizes = currentRecipe
    ? (currentRecipe.sizes && currentRecipe.sizes.length > 0
        ? currentRecipe.sizes
        : getDefaultRecipeSizes(currentRecipe.manualPrice))
    : [];

  // Discovery Box calculations (3x 5ml = 15ml total juice + packaging)
  const discoveryLiquidCost = Math.round((oilCost / 50) * 15);
  const discoveryTotalCogs = discoveryLiquidCost + (discoveryConfig.boxCost || 140);
  const discoveryProfit = discoveryConfig.price - discoveryTotalCogs;
  const discoveryMargin = discoveryConfig.price > 0 ? (discoveryProfit / discoveryConfig.price) * 100 : 0;

  const handlePriceChange = (val: number) => {
    if (!currentRecipe) return;
    updateRecipePrice(currentRecipe.id, Math.max(0, val));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const handleSizePriceChange = (sizeMl: number, val: number) => {
    if (!currentRecipe) return;
    updateRecipeSizePrice(currentRecipe.id, sizeMl, Math.max(0, val));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 75) return { label: 'Optimal Artisan Margin (>75%)', color: 'badge-profit' };
    if (margin >= 55) return { label: 'Healthy Commercial Margin (55-75%)', color: 'text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full px-2.5 py-1 font-bold' };
    if (margin >= 30) return { label: 'Discount / Thin Margin (30-55%)', color: 'text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2.5 py-1 font-bold' };
    return { label: 'Negative / Loss-Making (<30%)', color: 'text-rose-400 bg-rose-500/15 border border-rose-500/30 rounded-full px-2.5 py-1 font-bold' };
  };

  const marginBadge = getMarginBadge(marginPercent);

  if (recipes.length === 0) {
    return (
      <div className="space-y-4 pb-20 select-none">
        <div className="card-luxury rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-base font-extrabold text-white font-serif-luxury uppercase tracking-wider">
            Pricing Lab Awaiting Formulations
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto font-sans leading-relaxed">
            Create your first fragrance formulation in the Formulas tab to model gross profit margins, COGS, and bottle sizing tiers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Scent Selector */}
      <div className="card-luxury rounded-3xl p-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Active Fragrance Formulation
          </label>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
            {currentRecipe?.concentration}
          </span>
        </div>

        <select
          value={selectedRecipeId}
          onChange={(e) => setSelectedRecipeId(e.target.value)}
          className="w-full bg-[#14100d] border border-amber-500/25 text-white text-sm font-bold rounded-2xl px-3.5 py-2.5 outline-none focus:border-amber-400 transition font-sans"
        >
          {recipes.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} — Current Price: ₹{r.manualPrice.toLocaleString('en-IN')} ({r.inStockBottles} in stock)
            </option>
          ))}
        </select>
        <p className="text-xs text-stone-400 italic font-sans">
          "{currentRecipe?.tagline}"
        </p>
      </div>

      {/* Direct Retail Price (50ml Master) */}
      <div className="card-luxury rounded-3xl p-4.5 space-y-3.5 relative overflow-hidden border-amber-500/35">
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono">
              Direct Retail Price (50ml Bottle)
              {saveToast && (
                <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-0.5 animate-pulse font-mono">
                  <Check className="w-3 h-3" /> Updated
                </span>
              )}
            </span>
            <p className="text-[11px] text-stone-400 font-sans mt-0.5">
              Live retail rate. Updates customer storefront and UPI checkout instantaneously.
            </p>
          </div>
          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 shrink-0">
            Active Rate
          </span>
        </div>

        {/* Big Input in INR */}
        <div className="relative">
          <span className="absolute left-4 top-3 text-2xl font-bold text-amber-400 font-mono">
            ₹
          </span>
          <input
            type="number"
            step="50"
            value={currentPrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#14100d] border border-amber-500/35 text-amber-300 text-2xl font-extrabold rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:border-amber-400 font-mono tracking-wide"
          />
        </div>

        {/* Preset Pricing Shortcuts in INR */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <button
            onClick={() => handlePriceChange(1999)}
            className="p-2.5 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] border border-amber-500/15 text-center active:scale-95 transition"
          >
            <div className="text-[9px] text-stone-400 leading-tight font-sans">Friends & Family</div>
            <div className="font-extrabold text-xs text-white mt-0.5 font-mono">₹1,999</div>
          </button>
          <button
            onClick={() => handlePriceChange(2899)}
            className="p-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-center active:scale-95 transition shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <div className="text-[9px] text-amber-300 font-bold leading-tight font-sans">Signature Standard</div>
            <div className="font-black text-xs text-amber-300 mt-0.5 font-mono">₹2,899</div>
          </button>
          <button
            onClick={() => handlePriceChange(3499)}
            className="p-2.5 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] border border-amber-500/15 text-center active:scale-95 transition"
          >
            <div className="text-[9px] text-stone-400 leading-tight font-sans">Collector Reserve</div>
            <div className="font-extrabold text-xs text-white mt-0.5 font-mono">₹3,499</div>
          </button>
        </div>

        {/* Financial Metrics in INR */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#221a14]">
          <div className="bg-[#14100d] p-3 rounded-2xl border border-amber-500/15">
            <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Net Profit / Bottle
            </span>
            <div className={`text-xl font-extrabold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{Math.round(netProfit).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-[#14100d] p-3 rounded-2xl border border-amber-500/15">
            <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1 font-mono">
              <Percent className="w-3 h-3 text-amber-400" />
              Gross Margin
            </span>
            <div className={`text-xl font-extrabold font-mono mt-1 ${marginPercent >= 55 ? 'text-emerald-400' : marginPercent > 0 ? 'text-amber-300' : 'text-rose-400'}`}>
              {marginPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="text-center pt-1">
          <span className={marginBadge.color}>
            {marginBadge.label}
          </span>
        </div>
      </div>

      {/* Production Cost Breakdown in INR */}
      <div className="card-luxury rounded-3xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            50ml Unit Cost Breakdown (COGS)
          </h3>
          <span className="text-xs font-bold text-amber-300 font-mono">
            Total ₹{Math.round(totalCogs)} / bottle
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 flex justify-between items-center">
            <div>
              <span className="font-bold text-stone-200">Raw Oil Concentrate & Perfumer's Alcohol</span>
              <p className="text-[10px] text-stone-500 font-sans">
                {currentRecipe?.ingredients.length} formula oils ({concentrationPercent.toFixed(1)}% dilution)
              </p>
            </div>
            <span className="font-bold text-white font-mono">₹{Math.round(oilCost)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 flex justify-between items-center">
            <div>
              <span className="font-bold text-stone-200">Glass Bottle, Atomizer & Tag</span>
              <p className="text-[10px] text-stone-500 font-sans">
                Heavy base 50ml bottle + magnetic atomizer + metallic neck label
              </p>
            </div>
            <span className="font-bold text-white font-mono">₹{packCost}</span>
          </div>
        </div>
      </div>

      {/* MULTI-SIZE BOTTLE PRICING & MARGIN MATRIX */}
      <div className="card-luxury rounded-3xl p-4 space-y-3.5 border-amber-500/30">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Multi-Size Pricing & Margin Matrix
            </h3>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">
              Configure rates across 15ml, 30ml, 50ml, & 100ml tiers
            </p>
          </div>
          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
            4 Sizing Tiers
          </span>
        </div>

        <div className="space-y-2.5">
          {recipeSizes.map(size => {
            const sizeLiquidCost = Math.round((oilCost / 50) * size.sizeMl);
            const sizePackCost = size.packagingCost || (size.sizeMl === 15 ? 120 : size.sizeMl === 30 ? 210 : size.sizeMl === 50 ? 340 : 520);
            const sizeTotalCogs = sizeLiquidCost + sizePackCost;
            const sizeProfit = size.price - sizeTotalCogs;
            const sizeMargin = size.price > 0 ? (sizeProfit / size.price) * 100 : 0;

            return (
              <div
                key={size.sizeMl}
                className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 font-extrabold flex items-center justify-center text-xs border border-amber-500/25 font-mono">
                      {size.sizeMl}m
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">{size.label}</span>
                      <span className="text-[10px] text-stone-400 font-mono">Allocated Stock: {size.inStock} bottles</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-400 font-bold font-mono">₹</span>
                    <input
                      type="number"
                      step="50"
                      value={size.price}
                      onChange={(e) => handleSizePriceChange(size.sizeMl, parseFloat(e.target.value) || 0)}
                      className="w-24 bg-[#1b1510] border border-amber-500/40 text-amber-300 font-extrabold text-sm rounded-xl px-2.5 py-1 text-right outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Sizing Telemetry: Juice + Packaging = COGS -> Net Profit & Margin */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#0e0b08] border border-amber-500/10 text-center font-mono text-[10px]">
                  <div>
                    <span className="text-[8px] text-stone-500 block uppercase">Juice ({size.sizeMl}ml)</span>
                    <span className="font-bold text-stone-300">₹{sizeLiquidCost}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-stone-500 block uppercase">Packaging</span>
                    <span className="font-bold text-stone-300">₹{sizePackCost}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-amber-500/80 block uppercase">Unit COGS</span>
                    <span className="font-bold text-amber-400">₹{sizeTotalCogs}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-emerald-500/80 block uppercase">Net Profit</span>
                    <span className={`font-bold ${sizeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{Math.round(sizeProfit)} ({sizeMargin.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISCOVERY SAMPLE BOX ECONOMICS & PRICING */}
      <div className="card-luxury rounded-3xl p-4.5 space-y-3.5 border-amber-500/30">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            Discovery Coffret Economics (3 × 5ml)
          </h3>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {discoveryMargin.toFixed(0)}% Margin
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1 font-mono">
              Sample Box Price (₹)
            </label>
            <input
              type="number"
              step="50"
              value={discoveryConfig.price}
              onChange={(e) => updateDiscoveryConfig({ price: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#14100d] border border-amber-500/30 text-amber-300 font-bold rounded-2xl px-3 py-2 text-sm outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1 font-mono">
              Packaging Cost (3 Vials + Box)
            </label>
            <input
              type="number"
              value={discoveryConfig.boxCost}
              onChange={(e) => updateDiscoveryConfig({ boxCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#14100d] border border-amber-500/30 text-white font-bold rounded-2xl px-3 py-2 text-sm outline-none font-mono"
            />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 flex justify-between items-center text-xs font-mono">
          <div>
            <span className="text-stone-400 text-[11px]">Net Profit / Discovery Box:</span>
            <div className="text-sm font-extrabold text-emerald-400">
              ₹{discoveryProfit.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-stone-400 text-[11px]">Total Sample COGS:</span>
            <div className="text-sm font-bold text-white font-mono">
              ₹{discoveryTotalCogs}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
