import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Eye,
  Share2,
  Check,
  SlidersHorizontal,
  Search,
  Sparkles,
  Command,
  Database
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { profile, viewMode, setViewMode, activeTab, recipes, batches, orders } = useApp();
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

  const tabLabels: Record<string, string> = {
    dashboard: 'Overview & KPIs',
    aging: 'Production Pipeline',
    recipes: 'Formulation Lab',
    pricing: 'Pricing & Margins',
    orders: 'Orders & Dispatches',
    inventory: 'Stock & Materials'
  };

  return (
    <header className="sticky top-0 z-20 bg-[#080b12]/95 backdrop-blur-md border-b border-[#1a2130] px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-mono">
        {/* Left: Mobile Brand & Desktop Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Logo Brand Badge (visible < lg) */}
          <div className="flex lg:hidden items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#0f1422] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img src="/ostia-logo.png" alt="OSTIA" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white font-serif-luxury tracking-wide uppercase">
                  {profile.businessName}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">
                {viewMode === 'maker' ? profile.perfumerName : 'Public Storefront'}
              </p>
            </div>
          </div>

          {/* Desktop Breadcrumbs (visible >= lg) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
            <span className="font-bold text-white font-serif-luxury tracking-wider">OSTIA</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">{viewMode === 'maker' ? 'Studio Console' : 'Storefront'}</span>
            <span className="text-gray-600">/</span>
            <span className="text-amber-400 font-bold">{tabLabels[activeTab] || 'Atelier'}</span>

            {/* Offline Sync Status Badge */}
            <div className="ml-3 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline-First DB</span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Global Quick Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full py-1.5 px-3 rounded-xl bg-[#0f1422] hover:bg-[#151c2e] border border-[#1e2638] text-xs text-gray-400 flex items-center justify-between transition group shadow-inner"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition" />
              <span className="text-[11px] truncate">Search formulas, batches, orders (⌘K)...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#0b0e17] border border-[#232c40] text-[9px] text-gray-400 font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Telemetry Pills & Mode Switch */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search on mobile */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl bg-[#0f1422] hover:bg-[#151c2e] text-gray-400 hover:text-white border border-[#1e2638] transition"
          >
            <Search className="w-4 h-4 text-amber-400" />
          </button>

          {/* Revenue Pill (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0f1422] border border-[#1e2638] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Revenue:</span>
            <span className="text-emerald-400 font-bold">₹{totalCollectedINR.toLocaleString('en-IN')}</span>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'maker' ? 'storefront' : 'maker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              viewMode === 'storefront'
                ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-[#0f1422] hover:bg-[#161c2e] text-gray-300 border-[#1e2638]'
            }`}
          >
            {viewMode === 'maker' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Storefront</span>
                <span className="sm:hidden">Store</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                <span>Console</span>
              </>
            )}
          </button>

          {/* Copy Public Link Button */}
          <button
            onClick={copyStoreLink}
            title="Copy Public Storefront Link"
            className="p-2 rounded-xl bg-[#0f1422] hover:bg-[#161c2e] text-gray-300 hover:text-white border border-[#1e2638] active:scale-95 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
