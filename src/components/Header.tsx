import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FlaskConical, Eye, Share2, Check, SlidersHorizontal, IndianRupee, Layers, CheckSquare } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, viewMode, setViewMode, recipes, batches, orders, materials } = useApp();
  const [copied, setCopied] = useState(false);

  const copyStoreLink = () => {
    const url = window.location.origin + '?mode=store';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeBatchesCount = batches.filter(b => b.status === 'macerating').length;
  const totalStockBottles = recipes.reduce((sum, r) => sum + r.inStockBottles, 0);
  const totalCollectedINR = orders
    .filter(o => o.status === 'Paid' || o.status === 'Delivered')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <header className="sticky top-0 z-30 bg-[#0b0e14]/95 backdrop-blur-md border-b border-[#1c2230] px-4 py-2.5">
      <div className="max-w-xl mx-auto space-y-2">
        {/* Top Bar: Brand, Version, Currency & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/10">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-white font-mono uppercase">
                  Ostia
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  v2.0 • Pro
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center">
                  ₹ INR
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono tracking-tight">
                {viewMode === 'maker' ? 'Artisan Studio Terminal' : 'Public Storefront Preview'}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Copy Link */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode(viewMode === 'maker' ? 'storefront' : 'maker')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition border ${
                viewMode === 'storefront'
                  ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                  : 'bg-[#141824] hover:bg-[#1a2030] text-gray-300 border-[#222a3d]'
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
                  <span>Terminal</span>
                </>
              )}
            </button>

            <button
              onClick={copyStoreLink}
              title="Copy Customer Share Link"
              className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-gray-300 border border-[#222a3d] active:scale-95 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Telemetry Strip (Maker Mode Only) */}
        {viewMode === 'maker' && (
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div className="bg-[#121622] border border-[#1e2536] py-1 px-1.5 rounded-lg">
              <span className="text-[9px] text-gray-500 block uppercase">Aging Batches</span>
              <span className="text-xs font-bold text-amber-400">{activeBatchesCount} Active</span>
            </div>
            <div className="bg-[#121622] border border-[#1e2536] py-1 px-1.5 rounded-lg">
              <span className="text-[9px] text-gray-500 block uppercase">Bottled Stock</span>
              <span className="text-xs font-bold text-cyan-400">{totalStockBottles} Flacons</span>
            </div>
            <div className="bg-[#121622] border border-[#1e2536] py-1 px-1.5 rounded-lg">
              <span className="text-[9px] text-gray-500 block uppercase">Orders</span>
              <span className="text-xs font-bold text-gray-200">{orders.length} Total</span>
            </div>
            <div className="bg-[#121622] border border-[#1e2536] py-1 px-1.5 rounded-lg">
              <span className="text-[9px] text-gray-500 block uppercase">Revenue</span>
              <span className="text-xs font-bold text-emerald-400 truncate block">₹{totalCollectedINR.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
