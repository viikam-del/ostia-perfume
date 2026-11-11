import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Eye, Share2, Check, Store, SlidersHorizontal } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, viewMode, setViewMode } = useApp();
  const [copied, setCopied] = useState(false);

  const copyStoreLink = () => {
    const url = window.location.origin + '?mode=store';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#14171f]/95 backdrop-blur-md border-b border-[#252a36] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight font-serif-luxury">
                Ostia
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-amber-400/80 font-medium">
              {viewMode === 'maker' ? 'Studio OS' : 'Customer Boutique'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Copy Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'maker' ? 'storefront' : 'maker')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
              viewMode === 'storefront'
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                : 'bg-[#1e2330] hover:bg-[#252c3d] text-gray-300 border-[#2d3446]'
            }`}
          >
            {viewMode === 'maker' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Store View</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                <span>Back to Studio</span>
              </>
            )}
          </button>

          <button
            onClick={copyStoreLink}
            title="Copy Public Store Link"
            className="p-1.5 rounded-lg bg-[#1e2330] hover:bg-[#252c3d] text-gray-300 border border-[#2d3446] active:scale-95 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
