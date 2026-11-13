import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDefaultRecipeSizes } from '../data/initialData';
import { Calculator, TrendingUp, Percent, Info, Check, Sparkles, Box, Sliders, Layers } from 'lucide-react';

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
    if (margin >= 75) return { label: 'Optimal Artisan Margin (>75%)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (margin >= 55) return { label: 'Healthy Commercial Margin (55-75%)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (margin >= 30) return { label: 'Discount / Thin Margin (30-55%)', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'Negative / Loss-Making (<30%)', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  const marginBadge = getMarginBadge(marginPercent);

  return (
    <div className="space-y-4 pb-20 font-mono">
      {/* Scent Selector */}
      <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Active Fragrance Formulation
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
            {currentRecipe?.concentration}
          </span>
        </div>

        <select
          value={selectedRecipeId}
          onChange={(e) => setSelectedRecipeId(e.target.value)}
          className="w-full bg-[#080a0f] border border-[#222a3d] text-white text-sm font-bold rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 transition"
        >
          {recipes.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} — Current Price: {profile.currency}{r.manualPrice.toLocaleString('en-IN')} ({r.inStockBottles} in stock)
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2 italic font-sans">
          "{currentRecipe?.tagline}"
        </p>
      </div>

      {/* Responsive 2-column SaaS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Direct Manual Pricing in INR */}
        <div className="bg-gradient-to-br from-[#131722] to-[#0c0f17] border-2 border-amber-500/30 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                Direct Retail Price ({profile.currency} INR)
                {saveToast && (
                  <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-0.5 animate-pulse">
                    <Check className="w-3 h-3" /> Updated
                  </span>
                )}
              </span>
              <p className="text-[11px] text-gray-400 font-sans">
                Overrides default price. Synchronizes with public order link instantly.
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
              Manual Override
            </span>
          </div>

          {/* Big Input in INR */}
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-2xl font-bold text-amber-400">
              {profile.currency}
            </span>
            <input
              type="number"
              step="50"
              value={currentPrice}
              onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080a0f] border border-amber-500/40 text-amber-300 text-2xl font-extrabold rounded-xl pl-9 pr-4 py-2 outline-none focus:border-amber-400 font-mono tracking-wide"
            />
          </div>

          {/* Preset Pricing Shortcuts in INR */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => handlePriceChange(1999)}
              className="p-2 rounded-xl bg-[#0b0e14] hover:bg-[#141824] border border-[#1e2536] text-center active:scale-95 transition"
            >
              <div className="text-[9px] text-gray-400 leading-tight">Friends & Fam</div>
              <div className="font-bold text-xs text-white mt-0.5">{profile.currency}1,999</div>
            </button>
            <button
              onClick={() => handlePriceChange(2899)}
              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-center active:scale-95 transition"
            >
              <div className="text-[9px] text-amber-400 font-bold leading-tight">Standard</div>
              <div className="font-bold text-xs text-amber-300 mt-0.5">{profile.currency}2,899</div>
            </button>
            <button
              onClick={() => handlePriceChange(3499)}
              className="p-2 rounded-xl bg-[#0b0e14] hover:bg-[#141824] border border-[#1e2536] text-center active:scale-95 transition"
            >
              <div className="text-[9px] text-gray-400 leading-tight">Collector</div>
              <div className="font-bold text-xs text-white mt-0.5">{profile.currency}3,499</div>
            </button>
          </div>

          {/* Financial Metrics in INR */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2536]">
            <div className="bg-[#080a0f] p-2.5 rounded-xl border border-[#1c2230]">
              <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Net Profit / Bottle
              </span>
              <div className={`text-xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {profile.currency}{Math.round(netProfit).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-[#080a0f] p-2.5 rounded-xl border border-[#1c2230]">
              <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                <Percent className="w-3 h-3 text-emerald-400" />
                Gross Margin
              </span>
              <div className={`text-xl font-extrabold mt-1 ${marginPercent >= 55 ? 'text-emerald-400' : marginPercent > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {marginPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className={`text-center py-2 px-3 rounded-xl border text-[11px] font-bold ${marginBadge.color}`}>
            {marginBadge.label}
          </div>
        </div>

        {/* Right Column: COGS Breakdown + Discovery Box Economics */}
        <div className="space-y-4">
          {/* Production Cost Breakdown in INR */}
          <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                50ml Unit Cost Breakdown (COGS)
              </h3>
              <span className="text-xs font-bold text-amber-400">
                Total {profile.currency}{Math.round(totalCogs)} / flacon
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#080a0f] border border-[#1c2230] flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-200">Raw Oil Concentrate & ENA Alcohol</span>
                  <p className="text-[10px] text-gray-500 font-sans">
                    {currentRecipe?.ingredients.length} formula oils ({concentrationPercent.toFixed(1)}% dilution)
                  </p>
                </div>
                <span className="font-bold text-white">{profile.currency}{Math.round(oilCost)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080a0f] border border-[#1c2230] flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-200">French Glass Bottle, Atomizer & Collar Tag</span>
                  <p className="text-[10px] text-gray-500 font-sans">
                    Heavy base 50ml flacon + gold magnetic pump + collar card
                  </p>
                </div>
                <span className="font-bold text-white">{profile.currency}{packCost}</span>
              </div>
            </div>
          </div>

          {/* DISCOVERY SAMPLE BOX ECONOMICS & PRICING */}
          <div className="bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-amber-500/40 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                Discovery Sampler Set Economics (3 × 5ml)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {discoveryMargin.toFixed(0)}% Margin
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                  Sample Box Price ({profile.currency})
                </label>
                <input
                  type="number"
                  step="50"
                  value={discoveryConfig.price}
                  onChange={(e) => updateDiscoveryConfig({ price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#080a0f] border border-amber-500/40 text-amber-300 font-bold rounded-xl px-3 py-1.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                  Packaging (3 Vials + Box)
                </label>
                <input
                  type="number"
                  value={discoveryConfig.boxCost}
                  onChange={(e) => updateDiscoveryConfig({ boxCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#080a0f] border border-[#222a3d] text-white font-bold rounded-xl px-3 py-1.5 text-sm outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#080a0f] border border-[#1a2130] flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-400 text-[11px]">Net Profit / Discovery Box:</span>
                <div className="text-sm font-extrabold text-emerald-400">
                  {profile.currency}{discoveryProfit.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[11px]">Total Sample COGS:</span>
                <div className="text-sm font-bold text-white font-mono">
                  {profile.currency}{discoveryTotalCogs}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MULTI-SIZE FLACON PRICING & MARGIN MATRIX                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Flacon Sizing & Pricing Matrix
            </h3>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">
              Configure retail prices across 15ml, 30ml, 50ml, & 100ml tiers
            </p>
          </div>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
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
                className="p-3 rounded-2xl bg-[#080a0f] border border-[#1e2536] space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/25 font-mono">
                      {size.sizeMl}m
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">{size.label}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Stock: {size.inStock} bottles</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-400 font-bold font-mono">₹</span>
                    <input
                      type="number"
                      step="50"
                      value={size.price}
                      onChange={(e) => handleSizePriceChange(size.sizeMl, parseFloat(e.target.value) || 0)}
                      className="w-24 bg-[#121622] border border-amber-500/40 text-amber-300 font-extrabold text-sm rounded-lg px-2 py-1 text-right outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Sizing Telemetry: Liquid + Packaging = COGS -> Net Profit & Margin */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#0e121a] border border-[#1a2130] text-center font-mono text-[10px]">
                  <div>
                    <span className="text-[8px] text-gray-500 block uppercase">Juice ({size.sizeMl}ml)</span>
                    <span className="font-bold text-gray-300">₹{sizeLiquidCost}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 block uppercase">Pack Cost</span>
                    <span className="font-bold text-gray-300">₹{sizePackCost}</span>
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
    </div>
  );
};
