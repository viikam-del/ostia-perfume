import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { FlaskConical, Calculator, Hourglass, ReceiptText, Layers, LayoutDashboard } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, batches } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending Payment').length;
  const readyBatchesCount = batches.filter(b => b.status === 'ready_to_bottle').length;

  const activeProductionCount = batches.filter(b => b.currentStageId !== 'stocked').length;

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'aging', label: 'Pipeline', icon: Hourglass, badge: activeProductionCount },
    { id: 'recipes', label: 'Formulas', icon: FlaskConical },
    { id: 'pricing', label: 'Pricing', icon: Calculator },
    { id: 'orders', label: 'Orders', icon: ReceiptText, badge: pendingOrdersCount },
    { id: 'inventory', label: 'Materials', icon: Layers }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0b0e14]/95 backdrop-blur-md border-t border-[#1c2230] px-1 py-1.5 safe-bottom">
      <div className="max-w-xl mx-auto grid grid-cols-6 gap-0.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition font-mono ${
                isActive
                  ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 active:bg-gray-800/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 stroke-[2.2]' : 'text-gray-400'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-bold px-1 rounded-full min-w-3.5 text-center leading-tight">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
