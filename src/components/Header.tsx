import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Share2, Check, SlidersHorizontal } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-[#07090e]/95 backdrop-blur-md border-b border-[#182030]/80 px-3.5 py-2.5">
      <div className="space-y-2 font-mono">
        {/* Top Row: Brand Monogram + Title + Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Maker */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#0f1422] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img src="/ostia-logo.png" alt="OSTIA" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-[0.15em] text-white font-serif-luxury uppercase truncate">
                  {profile.businessName}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
                  ₹ INR
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate font-sans">
                {viewMode === 'maker' ? `Atelier • ${profile.perfumerName}` : `By ${profile.perfumerName} • Boutique`}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === 'maker' ? 'storefront' : 'maker')}
              className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border active:scale-95 ${
                viewMode === 'storefront'
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/25'
                  : 'bg-[#111624] hover:bg-[#161d30] text-amber-300 border-[#20293d]'
              }`}
            >
              {viewMode === 'maker' ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Store</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                  <span>Studio</span>
                </>
              )}
            </button>

            <button
              onClick={copyStoreLink}
              title="Copy Storefront Share Link"
              className="p-1.5 rounded-xl bg-[#111624] hover:bg-[#161d30] text-gray-300 border border-[#20293d] active:scale-95 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Maker Telemetry Strip (Single mobile row, perfectly aligned 3 stats) */}
        {viewMode === 'maker' && (
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="bg-[#0f1422] border border-[#1a2336] py-1 px-2 rounded-xl">
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Revenue</span>
              <span className="text-xs font-extrabold text-emerald-400 font-mono truncate block">
                ₹{totalCollectedINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#0f1422] border border-[#1a2336] py-1 px-2 rounded-xl">
              <span className="text-[9px] text-gray-500 block uppercase font-bold">In Maturation</span>
              <span className="text-xs font-extrabold text-amber-400 font-mono block">
                {activeBatchesCount} Batches
              </span>
            </div>
            <div className="bg-[#0f1422] border border-[#1a2336] py-1 px-2 rounded-xl">
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Flacons Stocked</span>
              <span className="text-xs font-extrabold text-cyan-400 font-mono block">
                {totalStockBottles} Ready
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
