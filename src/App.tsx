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
  const { viewMode, setViewMode, activeTab, theme } = useApp();

  // If ?mode=store or ?order in URL, switch to public customer view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'store' || params.get('order')) {
      setViewMode('storefront');
    }
  }, [setViewMode]);

  return (
    <div className={`min-h-screen app-outer ${theme === 'light' ? 'bg-[#ede8e1] text-[#1c1917]' : 'bg-[#050403] text-[#f4efe8]'} flex justify-center selection:bg-amber-500/30 selection:text-amber-200 antialiased relative overflow-x-hidden transition-colors duration-300`}>
      {/* Ambient background glow for large screens */}
      <div className="fixed inset-0 pointer-events-none hidden sm:block">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] ${theme === 'light' ? 'bg-gradient-to-b from-amber-400/20 via-orange-300/10 to-transparent' : 'bg-gradient-to-b from-amber-600/15 via-orange-600/5 to-transparent'} blur-3xl opacity-60`} />
      </div>

      {/* Strict Mobile-First App Container */}
      <div className={`w-full max-w-md min-h-screen app-container ${theme === 'light' ? 'bg-[#faf8f5] border-[#e2dad0]/90 shadow-[0_0_50px_rgba(180,83,9,0.08)]' : 'bg-[#090807] border-[#231d17]/90 shadow-[0_0_80px_rgba(0,0,0,0.95)]'} bg-horizon-amber sm:border-x flex flex-col relative overflow-x-hidden transition-colors duration-300`}>
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
