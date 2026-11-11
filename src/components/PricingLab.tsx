import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, Percent, TrendingUp, Info, Check, ShieldAlert, Sparkles, Feather } from 'lucide-react';

export const PricingLab: React.FC = () => {
  const { recipes, selectedRecipeId, setSelectedRecipeId, updateRecipePrice, calculateRecipeCogs, profile } = useApp();
  const [saveToast, setSaveToast] = useState(false);

  const currentRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];
  const { oilCost, packCost, totalCogs } = currentRecipe ? calculateRecipeCogs(currentRecipe) : { oilCost: 0, packCost: 0, totalCogs: 0 };

  const currentPrice = currentRecipe?.manualPrice || 0;
  const netProfit = currentPrice - totalCogs;
  const marginPercent = currentPrice > 0 ? (netProfit / currentPrice) * 100 : 0;

  const handlePriceChange = (val: number) => {
    if (!currentRecipe) return;
    updateRecipePrice(currentRecipe.id, Math.max(0, val));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 70) return { label: 'Excellent Artisan Margin', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (margin >= 50) return { label: 'Healthy Margin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (margin >= 25) return { label: 'Low Margin (Thin)', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    return { label: 'Below Cost / Negative', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  const marginBadge = getMarginBadge(marginPercent);

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Scent Switcher */}
      <div className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Selected Fragrance
          </label>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
            {currentRecipe?.concentration}
          </span>
        </div>

        <select
          value={selectedRecipeId}
          onChange={(e) => setSelectedRecipeId(e.target.value)}
          className="w-full bg-[#1e2330] border border-[#2d3446] text-white text-sm font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 transition"
        >
          {recipes.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.inStockBottles} bottles in stock)
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2 italic">
          "{currentRecipe?.tagline}"
        </p>
      </div>

      {/* Direct Pricing Override Card */}
      <div className="bg-gradient-to-br from-[#1a1f2c] to-[#161a24] border-2 border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              Direct Selling Price
              {saveToast && (
                <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-0.5 animate-pulse">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </span>
            <p className="text-[11px] text-gray-400">Set direct flat price (applies immediately to customer link)</p>
          </div>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Manual Override
          </span>
        </div>

        {/* Big Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-xl font-bold text-amber-400 font-serif-luxury">
            {profile.currency}
          </span>
          <input
            type="number"
            step="1"
            value={currentPrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#12151c] border border-amber-500/40 text-amber-300 text-2xl font-bold rounded-xl pl-8 pr-4 py-2 outline-none focus:border-amber-400 font-mono tracking-wide"
          />
        </div>

        {/* Preset Pricing Shortcuts */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => handlePriceChange(35)}
            className="p-2 rounded-xl bg-[#1e2330] hover:bg-[#262c3d] border border-[#2d3446] text-center active:scale-95 transition"
          >
            <div className="text-[10px] text-gray-400">Friends & Family</div>
            <div className="font-bold text-xs text-white mt-0.5">{profile.currency}35.00</div>
          </button>
          <button
            onClick={() => handlePriceChange(45)}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-center active:scale-95 transition"
          >
            <div className="text-[10px] text-amber-400 font-medium">Standard Retail</div>
            <div className="font-bold text-xs text-amber-300 mt-0.5">{profile.currency}45.00</div>
          </button>
          <button
            onClick={() => handlePriceChange(55)}
            className="p-2 rounded-xl bg-[#1e2330] hover:bg-[#262c3d] border border-[#2d3446] text-center active:scale-95 transition"
          >
            <div className="text-[10px] text-gray-400">Collector Edition</div>
            <div className="font-bold text-xs text-white mt-0.5">{profile.currency}55.00</div>
          </button>
        </div>

        {/* Live Margin Calculation Cards */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2d3446]">
          <div className="bg-[#12151c] p-2.5 rounded-xl border border-[#252b38]">
            <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Net Profit / Bottle
            </span>
            <div className={`text-lg font-bold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profile.currency}{netProfit.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#12151c] p-2.5 rounded-xl border border-[#252b38]">
            <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-400" />
              Gross Margin
            </span>
            <div className={`text-lg font-bold font-mono mt-1 ${marginPercent >= 50 ? 'text-emerald-400' : marginPercent > 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {marginPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className={`text-center py-1.5 px-3 rounded-lg border text-[11px] font-semibold ${marginBadge.color}`}>
          {marginBadge.label}
        </div>
      </div>

      {/* Production Cost Breakdown (COGS) */}
      <div className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            Unit Cost Breakdown (COGS)
          </h3>
          <span className="text-xs font-mono font-bold text-amber-400">
            Total {profile.currency}{totalCogs.toFixed(2)} / bottle
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#12151c] border border-[#252b38] flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-200">Raw Fragrance & Alcohol (50ml)</span>
              <p className="text-[10px] text-gray-400">Includes {currentRecipe?.ingredients.length} formula oils + SDA-40B carrier</p>
            </div>
            <span className="font-mono font-bold text-white">{profile.currency}{oilCost.toFixed(2)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#12151c] border border-[#252b38] flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-200">Packaging & Presentation</span>
              <p className="text-[10px] text-gray-400">Glass bottle, gold atomizer pump, foil label, linen box</p>
            </div>
            <span className="font-mono font-bold text-white">{profile.currency}{packCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Visual Progress Bar Ratio */}
        <div className="pt-2">
          <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
            <span>Cost: {currentPrice > 0 ? ((totalCogs / currentPrice) * 100).toFixed(0) : 0}%</span>
            <span>Profit: {marginPercent > 0 ? marginPercent.toFixed(0) : 0}%</span>
          </div>
          <div className="w-full bg-[#12151c] h-2.5 rounded-full overflow-hidden flex border border-[#252b38]">
            <div
              className="bg-red-400/80 h-full transition-all"
              style={{ width: `${Math.min(100, currentPrice > 0 ? (totalCogs / currentPrice) * 100 : 100)}%` }}
              title="COGS"
            />
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${Math.max(0, marginPercent)}%` }}
              title="Profit"
            />
          </div>
        </div>
      </div>

      {/* Scent Pyramid Preview */}
      <div className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Feather className="w-3.5 h-3.5 text-amber-400" />
          Olfactory Scent Pyramid
        </h3>
        
        <div className="space-y-2 text-xs">
          <div className="p-2 rounded-xl bg-[#1e2330]/60 border border-[#2d3446]">
            <span className="text-[10px] font-bold text-amber-300 uppercase">Top Notes (Opening 15m)</span>
            <p className="text-gray-300 mt-0.5">{currentRecipe?.pyramid.top.join(' • ')}</p>
          </div>
          <div className="p-2 rounded-xl bg-[#1e2330]/60 border border-[#2d3446]">
            <span className="text-[10px] font-bold text-pink-300 uppercase">Heart Notes (2-4 hours)</span>
            <p className="text-gray-300 mt-0.5">{currentRecipe?.pyramid.heart.join(' • ')}</p>
          </div>
          <div className="p-2 rounded-xl bg-[#1e2330]/60 border border-[#2d3446]">
            <span className="text-[10px] font-bold text-amber-500 uppercase">Base Notes (6-12+ hours)</span>
            <p className="text-gray-300 mt-0.5">{currentRecipe?.pyramid.base.join(' • ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
