import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Share2, Check, SlidersHorizontal, Sparkles, TrendingUp, Hourglass, Package } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, viewMode, setViewMode, recipes, batches, orders } = useApp();
  const [copied, setCopied] = useState(false);

  const copyStoreLink = () => {
    const url = window.location.origin + '?mode=store';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeBatchesCount = batches.filter(b => b.currentStageId !== 'stocked').length;
  const totalStockBottles = recipes.reduce((sum, r) => sum + r.inStockBottles, 0);
  const totalCollectedINR = orders
    .filter(o => o.status === 'Paid' || o.status === 'Delivered')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <header className="sticky top-0 z-30 bg-[#0a0806]/90 backdrop-blur-xl border-b border-[#241c15]/90 px-3.5 py-2.5 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="space-y-2.5">
        {/* Top Row: Brand Monogram + Title + Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Maker */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-[#14100c] border border-amber-500/30 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <img src="/ostia-logo.png" alt="OSTIA" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0806]" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-[0.2em] text-white font-serif-luxury uppercase truncate">
                  {profile.businessName}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                  ₹ INR
                </span>
              </div>
              <p className="text-[10px] text-stone-400 truncate flex items-center gap-1 font-sans">
                <span>By</span>
                <strong className="text-amber-200/90 font-medium">{profile.perfumerName}</strong>
                <span className="text-stone-600">•</span>
                <span className="text-amber-400/90">{viewMode === 'maker' ? 'Atelier Studio' : 'Haute Boutique'}</span>
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Toggle Pill */}
            <button
              onClick={() => setViewMode(viewMode === 'maker' ? 'storefront' : 'maker')}
              className={`py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                viewMode === 'storefront'
                  ? 'btn-glow-amber text-white'
                  : 'bg-[#15110d] hover:bg-[#1d1712] text-amber-300 border border-amber-500/25'
              }`}
            >
              {viewMode === 'maker' ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Store</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                  <span>Studio</span>
                </>
              )}
            </button>

            {/* Share Store Link Button */}
            <button
              onClick={copyStoreLink}
              title="Copy Storefront Share Link"
              className="p-2 rounded-full bg-[#15110d] hover:bg-[#1d1712] text-stone-300 border border-amber-500/20 active:scale-95 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Maker Telemetry Strip (Single mobile row, perfectly aligned 3 stats) */}
        {viewMode === 'maker' && (
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="bg-[#130f0c]/90 border border-amber-500/15 py-1.5 px-2 rounded-2xl shadow-sm">
              <span className="text-[8px] text-stone-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                Revenue
              </span>
              <span className="text-xs font-extrabold text-emerald-400 font-mono truncate block mt-0.5">
                ₹{totalCollectedINR.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-[#130f0c]/90 border border-amber-500/15 py-1.5 px-2 rounded-2xl shadow-sm">
              <span className="text-[8px] text-stone-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Hourglass className="w-2.5 h-2.5 text-amber-400" />
                Maturing
              </span>
              <span className="text-xs font-extrabold text-amber-400 font-mono block mt-0.5">
                {activeBatchesCount} Batches
              </span>
            </div>

            <div className="bg-[#130f0c]/90 border border-amber-500/15 py-1.5 px-2 rounded-2xl shadow-sm">
              <span className="text-[8px] text-stone-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Package className="w-2.5 h-2.5 text-orange-400" />
                Flacons
              </span>
              <span className="text-xs font-extrabold text-white font-mono block mt-0.5">
                {totalStockBottles} Ready
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
