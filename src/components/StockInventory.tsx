import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, AlertTriangle, Plus, Minus, Droplet, Box, Sparkles } from 'lucide-react';
import { MaterialType } from '../types';

export const StockInventory: React.FC = () => {
  const { materials, updateMaterialStock, addMaterial, profile } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialType>('oil');
  const [unit, setUnit] = useState<'g' | 'ml' | 'piece'>('g');
  const [costPerUnit, setCostPerUnit] = useState(0.5);
  const [stockQty, setStockQty] = useState(50);
  const [reorderPoint, setReorderPoint] = useState(15);
  const [supplier, setSupplier] = useState('');

  const oilsAndAlcohol = materials.filter(m => m.category === 'oil' || m.category === 'alcohol');
  const packagingHardware = materials.filter(m => m.category !== 'oil' && m.category !== 'alcohol');

  const lowStockCount = materials.filter(m => m.stockQty <= m.reorderPoint).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMaterial({
      name: name.trim(),
      category,
      unit,
      costPerUnit,
      stockQty,
      reorderPoint,
      supplier: supplier.trim() || undefined
    });

    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#171b24] border border-[#262c3b] rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif-luxury">
            <Package className="w-4 h-4 text-amber-400" />
            Raw Materials & Hardware Stock
          </h2>
          <p className="text-[11px] text-gray-400">Inventory levels and reorder warnings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockCount > 0 && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">{lowStockCount} items low in stock!</span>
            <p className="text-[11px] text-amber-400/80">Re-order packaging or oils soon so your next batch isn't held up.</p>
          </div>
        </div>
      )}

      {/* Packaging & Hardware Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Box className="w-3.5 h-3.5 text-amber-400" />
          Bottling Hardware & Packaging
        </h3>

        <div className="space-y-2">
          {packagingHardware.map(item => {
            const isLow = item.stockQty <= item.reorderPoint;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isLow ? 'bg-[#1b191f] border-amber-500/40' : 'bg-[#171b24] border-[#262c3b]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {profile.currency}{item.costPerUnit.toFixed(2)} / {item.unit} • {item.supplier || 'Local Supplier'}
                  </div>
                </div>

                {/* Mobile Stepper Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMaterialStock(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-[#1e2330] hover:bg-[#252c3d] text-gray-300 flex items-center justify-center border border-[#2d3446] active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-xs font-bold text-white min-w-8 text-center">
                    {item.stockQty}
                  </span>
                  <button
                    onClick={() => updateMaterialStock(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#1e2330] hover:bg-[#252c3d] text-gray-300 flex items-center justify-center border border-[#2d3446] active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fragrance Oils & Alcohol Section */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Droplet className="w-3.5 h-3.5 text-amber-400" />
          Aroma Molecules & Carrier Liquids
        </h3>

        <div className="space-y-2">
          {oilsAndAlcohol.map(item => {
            const isLow = item.stockQty <= item.reorderPoint;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isLow ? 'bg-[#1b191f] border-amber-500/40' : 'bg-[#171b24] border-[#262c3b]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {profile.currency}{item.costPerUnit.toFixed(3)} / {item.unit} • {item.supplier || 'Specialty Distillery'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMaterialStock(item.id, -5)}
                    className="w-7 h-7 rounded-lg bg-[#1e2330] hover:bg-[#252c3d] text-gray-300 flex items-center justify-center border border-[#2d3446] active:scale-95 text-[10px] font-bold"
                  >
                    -5
                  </button>
                  <span className="font-mono text-xs font-bold text-white min-w-10 text-center">
                    {item.stockQty}{item.unit}
                  </span>
                  <button
                    onClick={() => updateMaterialStock(item.id, 5)}
                    className="w-7 h-7 rounded-lg bg-[#1e2330] hover:bg-[#252c3d] text-gray-300 flex items-center justify-center border border-[#2d3446] active:scale-95 text-[10px] font-bold"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171b24] border border-[#2d3446] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif-luxury">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Add Raw Material
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. French Lavender Absolute"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as MaterialType;
                      setCategory(cat);
                      if (cat === 'oil') setUnit('g');
                      else if (cat === 'alcohol') setUnit('ml');
                      else setUnit('piece');
                    }}
                    className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-2 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="oil">Fragrance Oil (g)</option>
                    <option value="alcohol">Alcohol (ml)</option>
                    <option value="bottle">Glass Bottle (pc)</option>
                    <option value="pump">Atomizer Pump (pc)</option>
                    <option value="label">Label (pc)</option>
                    <option value="box">Rigid Box (pc)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Unit Cost ({profile.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Current Stock Qty</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Low Alert Threshold</label>
                  <input
                    type="number"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Supplier / Distillery</label>
                <input
                  type="text"
                  placeholder="e.g. Robertet"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#1e2330] text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-sm"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
