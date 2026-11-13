import React, { useState, useEffect } from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import {
  Search,
  FlaskConical,
  Hourglass,
  ReceiptText,
  Layers,
  Calculator,
  Eye,
  Plus,
  ArrowRight,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { recipes, batches, orders, materials, setActiveTab, setViewMode } = useApp();
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results
  const matchingRecipes = recipes.filter(r => r.name.toLowerCase().includes(q) || r.tagline.toLowerCase().includes(q));
  const matchingBatches = batches.filter(b => b.batchNumber.toLowerCase().includes(q) || b.recipeName.toLowerCase().includes(q));
  const matchingOrders = orders.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.recipeName.toLowerCase().includes(q));
  const matchingMaterials = materials.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-20 animate-fadeIn">
      <div className="bg-[#0b0e17] border border-[#1e2638] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden font-mono text-xs">
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1b2334] bg-[#0f1422]">
          <Search className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search formulas, aging batches, orders, or materials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white outline-none placeholder:text-gray-500 text-xs font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#182030] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Content Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions (when query is empty) */}
          {!q && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-3 py-1">
                Studio Quick Actions
              </div>
              <button
                onClick={() => navigateTo('aging')}
                className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Brew New Perfume Batch</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                onClick={() => navigateTo('recipes')}
                className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                  <span>Formulation Studio (New Recipe)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                onClick={() => { setViewMode('storefront'); onClose(); }}
                className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Public Client Storefront</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Recipes Matches */}
          {matchingRecipes.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-3 py-1">
                Formulas ({matchingRecipes.length})
              </div>
              {matchingRecipes.map(r => (
                <button
                  key={r.id}
                  onClick={() => navigateTo('recipes')}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FlaskConical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold text-white truncate">{r.name}</span>
                    <span className="text-[10px] text-gray-500 truncate">({r.concentration})</span>
                  </div>
                  <span className="text-amber-400 font-bold shrink-0">₹{r.manualPrice}</span>
                </button>
              ))}
            </div>
          )}

          {/* Batches Matches */}
          {matchingBatches.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-3 py-1">
                Pipeline Batches ({matchingBatches.length})
              </div>
              {matchingBatches.map(b => (
                <button
                  key={b.id}
                  onClick={() => navigateTo('aging')}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Hourglass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold text-white">{b.batchNumber}</span>
                    <span className="text-gray-400 truncate">{b.recipeName}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-bold shrink-0">{b.currentStageId}</span>
                </button>
              ))}
            </div>
          )}

          {/* Orders Matches */}
          {matchingOrders.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-3 py-1">
                Customer Orders ({matchingOrders.length})
              </div>
              {matchingOrders.map(o => (
                <button
                  key={o.id}
                  onClick={() => navigateTo('orders')}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ReceiptText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-amber-300">{o.orderNumber}</span>
                    <span className="text-white truncate">{o.customerName}</span>
                  </div>
                  <span className="text-emerald-400 font-bold shrink-0">₹{o.price}</span>
                </button>
              ))}
            </div>
          )}

          {/* Materials Matches */}
          {matchingMaterials.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-3 py-1">
                Stock Materials ({matchingMaterials.length})
              </div>
              {matchingMaterials.map(m => (
                <button
                  key={m.id}
                  onClick={() => navigateTo('inventory')}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#121726] flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-white truncate">{m.name}</span>
                    <span className="text-[10px] text-gray-500 truncate">({m.category})</span>
                  </div>
                  <span className="text-gray-400 font-bold shrink-0">{m.stockQty} {m.unit}</span>
                </button>
              ))}
            </div>
          )}

          {q && matchingRecipes.length === 0 && matchingBatches.length === 0 && matchingOrders.length === 0 && matchingMaterials.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-[#1b2334] bg-[#080b12] text-[10px] text-gray-500 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1 py-0.2 rounded bg-[#111624] text-gray-400 border border-[#1e2638]">ESC to close</kbd>
          </div>
          <span>OSTIA Studio Command</span>
        </div>
      </div>
    </div>
  );
};
