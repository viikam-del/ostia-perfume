import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, AlertTriangle, Plus, Minus, Droplet, Box, Sparkles } from 'lucide-react';
import { MaterialType } from '../types';

export const StockInventory: React.FC = () => {
  const { materials, updateMaterialStock, addMaterial, profile } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialType>('oil');
  const [unit, setUnit] = useState<'g' | 'ml' | 'piece'>('g');
  const [costPerUnit, setCostPerUnit] = useState(45.00);
  const [stockQty, setStockQty] = useState(100);
  const [reorderPoint, setReorderPoint] = useState(25);
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
    <div className="space-y-4 pb-20 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-amber-400" />
            Raw Materials & Hardware Stock
          </h2>
          <p className="text-[11px] text-gray-400">
            Real-time inventory levels, INR unit costs, & restock alerts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Stock</span>
        </button>
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockCount > 0 && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">{lowStockCount} items below safety reorder threshold!</span>
            <p className="text-[10px] text-amber-400/80 font-sans">
              Replenish essential flacons or aroma materials to prevent bottling delays.
            </p>
          </div>
        </div>
      )}

      {/* Packaging & Hardware Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Box className="w-3.5 h-3.5 text-amber-400" />
          Bottling Hardware & Packaging ({packagingHardware.length} items)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {packagingHardware.map(item => {
            const isLow = item.stockQty <= item.reorderPoint;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isLow ? 'bg-[#141219] border-amber-500/40' : 'bg-[#10141e] border-[#1e2536]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {profile.currency}{item.costPerUnit.toFixed(2)} / {item.unit} • {item.supplier || 'Local Supplier'}
                  </div>
                </div>

                {/* Mobile Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMaterialStock(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-gray-300 flex items-center justify-center border border-[#222a3d] active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-extrabold text-white min-w-8 text-center">
                    {item.stockQty}
                  </span>
                  <button
                    onClick={() => updateMaterialStock(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-gray-300 flex items-center justify-center border border-[#222a3d] active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fragrance Oils & Carrier Alcohol Section */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Droplet className="w-3.5 h-3.5 text-amber-400" />
          Aroma Concentrate & Carrier Liquids ({oilsAndAlcohol.length} items)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {oilsAndAlcohol.map(item => {
            const isLow = item.stockQty <= item.reorderPoint;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isLow ? 'bg-[#141219] border-amber-500/40' : 'bg-[#10141e] border-[#1e2536]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {profile.currency}{item.costPerUnit.toFixed(2)} / {item.unit} • {item.supplier || 'Specialty Distillery'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMaterialStock(item.id, -5)}
                    className="w-7 h-7 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-gray-300 flex items-center justify-center border border-[#222a3d] active:scale-95 text-[10px] font-bold"
                  >
                    -5
                  </button>
                  <span className="text-xs font-extrabold text-white min-w-10 text-center">
                    {item.stockQty}{item.unit}
                  </span>
                  <button
                    onClick={() => updateMaterialStock(item.id, 5)}
                    className="w-7 h-7 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-gray-300 flex items-center justify-center border border-[#222a3d] active:scale-95 text-[10px] font-bold"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-[#0e121a] border border-[#222a3d] rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1c2230] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
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
                <label className="text-gray-400 block mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madagascan Vanilla Absolute"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
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
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-2 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="oil">Aroma Oil (g)</option>
                    <option value="alcohol">Alcohol (ml)</option>
                    <option value="bottle">Flacon (pc)</option>
                    <option value="pump">Atomizer (pc)</option>
                    <option value="label">Label (pc)</option>
                    <option value="box">Box (pc)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Unit Cost ({profile.currency})</label>
                  <input
                    type="number"
                    step="0.5"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Starting Stock</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Reorder Alert</label>
                  <input
                    type="number"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Supplier / Laboratory</label>
                <input
                  type="text"
                  placeholder="e.g. Synthite / Biolandes"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#141824] text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-md shadow-amber-500/20"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
