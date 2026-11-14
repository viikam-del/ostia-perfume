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
    <div className="space-y-4 pb-20 select-none">
      {/* Header */}
      <div className="card-luxury rounded-3xl p-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide font-mono">
            <Layers className="w-4 h-4 text-amber-400" />
            Stockroom & Raw Materials
          </h2>
          <p className="text-[11px] text-stone-400 font-sans mt-0.5">
            Aroma isolates, bottle inventory & INR unit economics
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-glow-amber px-3.5 py-2 rounded-2xl text-xs font-bold font-mono flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Stock</span>
        </button>
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold font-mono">{lowStockCount} items below safety reorder threshold!</span>
            <p className="text-[10px] text-amber-400/80 font-sans mt-0.5">
              Replenish essential bottles or aroma materials to prevent bottling delays.
            </p>
          </div>
        </div>
      )}

      {/* Packaging & Hardware Section */}
      {materials.length === 0 ? (
        <div className="card-luxury rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Layers className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-base font-extrabold text-white font-serif-luxury uppercase tracking-wider">
            Studio Inventory Ready
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto font-sans leading-relaxed">
            No materials registered yet. Tap "+ Add Stock" above to log your raw oils, alcohol carrier, bottles, pumps, and packaging boxes.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 px-1 font-mono">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              Bottling Hardware & Packaging ({packagingHardware.length} items)
            </h3>

            <div className="space-y-2">
          {packagingHardware.map(item => {
            const isLow = item.stockQty <= item.reorderPoint;
            return (
              <div
                key={item.id}
                className={`card-luxury rounded-2xl p-3.5 flex items-center justify-between gap-2 ${
                  isLow ? 'border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : ''
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-white truncate max-w-full font-sans">{item.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded-full border border-amber-500/30 shrink-0">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5 truncate font-mono">
                    ₹{item.costPerUnit.toFixed(2)} / {item.unit} • {item.supplier || 'Bespoke Supplier'}
                  </div>
                </div>

                {/* Mobile Stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateMaterialStock(item.id, -1)}
                    className="w-8 h-8 rounded-xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 flex items-center justify-center border border-amber-500/20 active:scale-95 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-white min-w-8 text-center font-mono">
                    {item.stockQty}
                  </span>
                  <button
                    onClick={() => updateMaterialStock(item.id, 1)}
                    className="w-8 h-8 rounded-xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 flex items-center justify-center border border-amber-500/20 active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fragrance Oils & Carrier Alcohol Section */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 px-1 font-mono">
          <Droplet className="w-3.5 h-3.5 text-amber-400" />
          Aroma Concentrate & Carrier Liquids ({oilsAndAlcohol.length} items)
        </h3>

        <div className="space-y-2">
          {oilsAndAlcohol.map(item => {
            const isLow = item.stockQty <= item.reorderPoint;
            return (
              <div
                key={item.id}
                className={`card-luxury rounded-2xl p-3.5 flex items-center justify-between gap-2 ${
                  isLow ? 'border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : ''
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-white truncate max-w-full font-sans">{item.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded-full border border-amber-500/30 shrink-0">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5 truncate font-mono">
                    ₹{item.costPerUnit.toFixed(2)} / {item.unit} • {item.supplier || 'Specialty Distiller'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateMaterialStock(item.id, -5)}
                    className="w-8 h-8 rounded-xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 flex items-center justify-center border border-amber-500/20 active:scale-95 text-[10px] font-bold font-mono transition"
                  >
                    -5
                  </button>
                  <span className="text-xs font-black text-white min-w-10 text-center font-mono">
                    {item.stockQty}{item.unit}
                  </span>
                  <button
                    onClick={() => updateMaterialStock(item.id, 5)}
                    className="w-8 h-8 rounded-xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 flex items-center justify-center border border-amber-500/20 active:scale-95 text-[10px] font-bold font-mono transition"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="card-luxury rounded-3xl p-5 max-w-sm w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl my-auto animate-scaleUp no-scrollbar border-amber-500/30">
            <div className="flex justify-between items-center border-b border-[#221a14] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Add Raw Material
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-xl bg-[#14100d]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-stone-400 block mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madagascan Vanilla Absolute"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as MaterialType;
                      setCategory(cat);
                      if (cat === 'oil') setUnit('g');
                      else if (cat === 'alcohol') setUnit('ml');
                      else setUnit('piece');
                    }}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-2 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="oil">Aroma Oil (g)</option>
                    <option value="alcohol">Alcohol (ml)</option>
                    <option value="bottle">Bottle (pc)</option>
                    <option value="pump">Atomizer (pc)</option>
                    <option value="label">Label (pc)</option>
                    <option value="box">Box (pc)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 block mb-1">Starting Stock</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Supplier / Laboratory</label>
                <input
                  type="text"
                  placeholder="e.g. Synthite / Biolandes"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#14100d] text-stone-300 font-bold border border-amber-500/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-glow-amber py-2.5 rounded-2xl font-extrabold uppercase"
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
