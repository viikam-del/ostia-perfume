import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { RecipeManager } from './components/RecipeManager';
import { PricingLab } from './components/PricingLab';
import { BatchAgingTracker } from './components/BatchAgingTracker';
import { OrderManagement } from './components/OrderManagement';
import { StockInventory } from './components/StockInventory';
import { Dashboard } from './components/Dashboard';
import { CustomerStorefront } from './components/CustomerStorefront';
import { CommandPalette } from './components/CommandPalette';

export const App: React.FC = () => {
  const { viewMode, setViewMode, activeTab } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // If ?mode=store or ?order in URL, switch to public customer view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'store' || params.get('order')) {
      setViewMode('storefront');
    }
  }, [setViewMode]);

  // Global keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#06080e] text-[#f1f3f7] flex selection:bg-amber-500/30 selection:text-amber-200">
      {/* SaaS Desktop Sidebar (Visible on desktop screens >= lg) */}
      {viewMode === 'maker' && (
        <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Dynamic SaaS Canvas */}
        <main className={`flex-1 w-full mx-auto ${
          viewMode === 'storefront'
            ? 'max-w-4xl p-4 sm:p-6 lg:p-8'
            : 'max-w-7xl p-3.5 sm:p-5 lg:p-8'
        }`}>
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

              {/* Mobile Bottom Dock (Hidden on desktop) */}
              <BottomNav />
            </>
          )}
        </main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default App;
