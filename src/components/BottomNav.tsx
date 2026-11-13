import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { LayoutDashboard, Hourglass, FlaskConical, ReceiptText, Layers } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, batches } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending Payment').length;
  const activeProductionCount = batches.filter(b => b.currentStageId !== 'stocked').length;

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Studio', icon: LayoutDashboard },
    { id: 'aging', label: 'Pipeline', icon: Hourglass, badge: activeProductionCount },
    { id: 'recipes', label: 'Formulas', icon: FlaskConical },
    { id: 'orders', label: 'Orders', icon: ReceiptText, badge: pendingOrdersCount },
    { id: 'inventory', label: 'Stock', icon: Layers }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none safe-bottom px-3 pb-2">
      <div className="w-full max-w-md bg-[#110e0b]/92 backdrop-blur-2xl border border-amber-500/20 rounded-3xl px-2.5 py-2 pointer-events-auto shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'recipes' && activeTab === 'pricing');

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-amber-300 font-bold bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 shadow-[inset_0_1px_0_rgba(245,158,11,0.3),0_0_12px_rgba(245,158,11,0.15)]'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-[#18130e]/50'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-amber-400 scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-md">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] mt-1 font-sans tracking-tight ${isActive ? 'font-extrabold text-amber-200' : 'font-medium'}`}>
                  {tab.label}
                </span>

                {/* Subtle bottom active dot */}
                {isActive && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
