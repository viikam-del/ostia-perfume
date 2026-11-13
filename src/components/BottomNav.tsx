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
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none safe-bottom">
      <div className="w-full max-w-md bg-[#0b0e16]/95 backdrop-blur-xl border-t border-[#1c2333] px-2 py-2 pointer-events-auto shadow-2xl">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'recipes' && activeTab === 'pricing');

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 font-mono ${
                  isActive
                    ? 'text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/25 shadow-inner'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.4]' : 'text-gray-400 stroke-[1.8]'}`} />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-md">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] mt-1 font-sans tracking-tight font-bold">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
