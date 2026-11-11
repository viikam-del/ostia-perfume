import React from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Hourglass, ReceiptText, Package } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending Payment').length;

  const tabs = [
    { id: 'pricing', label: 'Pricing Lab', icon: Calculator },
    { id: 'aging', label: 'Batch Aging', icon: Hourglass },
    { id: 'orders', label: 'Orders & QR', icon: ReceiptText, badge: pendingOrdersCount },
    { id: 'inventory', label: 'Raw Stock', icon: Package }
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#12151c]/95 backdrop-blur-md border-t border-[#252a36] px-2 py-2 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition relative ${
                isActive
                  ? 'text-amber-400 font-semibold bg-amber-500/10'
                  : 'text-gray-400 hover:text-gray-200 active:bg-gray-800/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.2]' : 'text-gray-400'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
