import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Hourglass,
  FlaskConical,
  Calculator,
  ReceiptText,
  Layers,
  Eye,
  Plus,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch }) => {
  const { activeTab, setActiveTab, setViewMode, profile, batches, orders, recipes } = useApp();

  const activeBatchesCount = batches.filter(b => b.currentStageId !== 'stocked').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending Payment').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number; description: string }[] = [
    {
      id: 'dashboard',
      label: 'Overview & KPIs',
      icon: LayoutDashboard,
      description: 'Telemetry & studio radar'
    },
    {
      id: 'aging',
      label: 'Production Pipeline',
      icon: Hourglass,
      badge: activeBatchesCount,
      description: '7-stage aging & reminders'
    },
    {
      id: 'recipes',
      label: 'Formulation Studio',
      icon: FlaskConical,
      description: 'Recipes & olfactory pyramids'
    },
    {
      id: 'pricing',
      label: 'Pricing & Margin Lab',
      icon: Calculator,
      description: 'Unit economics & COGS'
    },
    {
      id: 'orders',
      label: 'Orders & Dispatches',
      icon: ReceiptText,
      badge: pendingOrdersCount,
      description: 'Client allocations & payments'
    },
    {
      id: 'inventory',
      label: 'Materials & Stock',
      icon: Layers,
      description: 'Aroma chemicals & glass packaging'
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#090c13] border-r border-[#1a2130] h-screen sticky top-0 shrink-0 font-mono select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1a2130]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0f1420] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-md">
            <img src="/ostia-logo.png" alt="OSTIA" className="w-9 h-9 object-contain filter drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-widest text-white font-serif-luxury uppercase">
                {profile.businessName}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate font-sans">
              Haute Parfumerie Atelier
            </p>
          </div>
        </div>

        {/* Global Quick Search Launcher */}
        <button
          onClick={onOpenSearch}
          className="w-full mt-4 py-2 px-3 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-[#1e2638] text-xs text-gray-400 flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition" />
            <span className="text-[11px]">Quick Jump...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#0b0e17] border border-[#232c40] text-[9px] text-gray-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-3 mb-2">
          Studio Navigation
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between group ${
                isActive
                  ? 'bg-amber-500/10 border border-amber-500/30 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#111624] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-amber-400 text-black shadow-sm' : 'bg-[#131724] text-gray-400 group-hover:text-amber-400'
                }`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold block truncate">{item.label}</span>
                  <span className="text-[10px] text-gray-500 block truncate font-sans">{item.description}</span>
                </div>
              </div>

              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-amber-400 text-black'
                    : 'bg-[#1b2234] text-amber-300 border border-amber-400/20'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Studio Shortcuts */}
        <div className="pt-4 px-3">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
            Quick Actions
          </div>
          <button
            onClick={() => setActiveTab('aging')}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Brew New Batch</span>
          </button>
        </div>
      </div>

      {/* Storefront Launcher & Master Perfumer Footer */}
      <div className="p-3 border-t border-[#1a2130] space-y-2.5 bg-[#07090f]">
        {/* View Storefront Pill */}
        <button
          onClick={() => setViewMode('storefront')}
          className="w-full py-2 px-3 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-[#1e2638] text-xs text-amber-300 font-bold flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">Client Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition" />
        </button>

        {/* Perfumer Profile Card */}
        <div className="p-2.5 rounded-xl bg-[#0b0e17] border border-[#192132] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shrink-0">
            <div className="w-full h-full rounded-full bg-[#0d1017] flex items-center justify-center text-amber-300 font-serif-luxury font-bold text-xs">
              FP
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block truncate font-serif-luxury">
              {profile.perfumerName}
            </span>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Master Perfumer</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
