import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RecipeManager } from './components/RecipeManager';
import { PricingLab } from './components/PricingLab';
import { BatchAgingTracker } from './components/BatchAgingTracker';
import { OrderManagement } from './components/OrderManagement';
import { StockInventory } from './components/StockInventory';
import { Dashboard } from './components/Dashboard';
import { CustomerStorefront } from './components/CustomerStorefront';

export const App: React.FC = () => {
  const { viewMode, setViewMode, activeTab } = useApp();

  // If ?mode=store or ?order in URL, switch to public customer view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'store' || params.get('order')) {
      setViewMode('storefront');
    }
  }, [setViewMode]);

  return (
    <div className="min-h-screen bg-[#030407] text-[#f1f3f7] flex justify-center selection:bg-amber-500/30 selection:text-amber-200">
      {/* Strict Mobile-First App Container */}
      <div className="w-full max-w-md min-h-screen bg-[#07090e] sm:border-x border-[#182030]/60 flex flex-col relative shadow-2xl">
        {/* Mobile Sticky Header */}
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 w-full px-3.5 py-4 pb-28 overflow-x-hidden">
          {viewMode === 'storefront' ? (
            <CustomerStorefront />
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'aging' && <BatchAgingTracker />}
              {activeTab === 'recipes' && <RecipeManager />}
              {activeTab === 'pricing' && <PricingLab />}
              {activeTab === 'orders' && <OrderManagement />}
              {activeTab === 'inventory' && <StockInventory />}
            </>
          )}
        </main>

        {/* Thumb-Reachable Fixed Bottom Navigation Bar (Maker Mode Only) */}
        {viewMode === 'maker' && <BottomNav />}
      </div>
    </div>
  );
};

export default App;
