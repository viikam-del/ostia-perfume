import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PricingLab } from './components/PricingLab';
import { BatchAgingTracker } from './components/BatchAgingTracker';
import { OrderManagement } from './components/OrderManagement';
import { StockInventory } from './components/StockInventory';
import { CustomerStorefront } from './components/CustomerStorefront';

export const App: React.FC = () => {
  const { viewMode, setViewMode, activeTab } = useApp();

  // Check URL query parameters: if ?mode=store or ?order, open directly in customer view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'store' || params.get('order')) {
      setViewMode('storefront');
    }
  }, [setViewMode]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f1f3f7] flex flex-col selection:bg-amber-500/30">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Responsive Screen Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {viewMode === 'storefront' ? (
          <CustomerStorefront />
        ) : (
          <>
            {activeTab === 'pricing' && <PricingLab />}
            {activeTab === 'aging' && <BatchAgingTracker />}
            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'inventory' && <StockInventory />}
            
            {/* Mobile Bottom Navigation */}
            <BottomNav />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
