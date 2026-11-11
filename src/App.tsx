import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RecipeManager } from './components/RecipeManager';
import { PricingLab } from './components/PricingLab';
import { BatchAgingTracker } from './components/BatchAgingTracker';
import { OrderManagement } from './components/OrderManagement';
import { StockInventory } from './components/StockInventory';
import { RoadmapTracker } from './components/RoadmapTracker';
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
    <div className="min-h-screen bg-[#07090e] text-[#f1f3f7] flex flex-col selection:bg-amber-500/30">
      {/* Sticky Header with Telemetry & Mode Switch */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-3.5 sm:p-5">
        {viewMode === 'storefront' ? (
          <CustomerStorefront />
        ) : (
          <>
            {activeTab === 'recipes' && <RecipeManager />}
            {activeTab === 'pricing' && <PricingLab />}
            {activeTab === 'aging' && <BatchAgingTracker />}
            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'inventory' && <StockInventory />}
            {activeTab === 'roadmap' && <RoadmapTracker />}

            {/* Bottom Nav Bar */}
            <BottomNav />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
