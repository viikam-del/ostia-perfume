import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, RecipeIngredient } from '../types';
import { FlaskConical, Plus, Trash2, Scale, Sparkles, Check, Info, Layers, ChevronRight } from 'lucide-react';

export const RecipeManager: React.FC = () => {
  const { recipes, materials, addRecipe, deleteRecipe, scaleRecipe, calculateRecipeCogs, profile, setSelectedRecipeId, setActiveTab } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [concentration, setConcentration] = useState('Extrait de Parfum (24%)');
  const [batchVolumeMl, setBatchVolumeMl] = useState(500);
  const [maturationDays, setMaturationDays] = useState(30);
  const [bottleMaterialCost, setBottleMaterialCost] = useState(340);
  const [manualPrice, setManualPrice] = useState(2999);
  const [topNotes, setTopNotes] = useState('Italian Bergamot, Pink Pepper');
  const [heartNotes, setHeartNotes] = useState('Cardamom, Frankincense');
  const [baseNotes, setBaseNotes] = useState('Sandalwood, Amber Resin');

  // Dynamic Ingredients for new formulation
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { materialId: 'mat-1', materialName: 'Italian Bergamot FCF', amountGrams: 35, noteType: 'top' },
    { materialId: 'mat-2', materialName: 'Cardamom & Pink Pepper CO2', amountGrams: 25, noteType: 'heart' },
    { materialId: 'mat-3', materialName: 'Mysore Sandalwood & Amber', amountGrams: 50, noteType: 'base' },
    { materialId: 'mat-7', materialName: 'Perfumers ENA (SDA-40B 99.9%)', amountGrams: 390, noteType: 'carrier' }
  ]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddIngredientRow = () => {
    const firstOil = materials.find(m => m.category === 'oil') || materials[0];
    setIngredients(prev => [
      ...prev,
      {
        materialId: firstOil ? firstOil.id : 'mat-1',
        materialName: firstOil ? firstOil.name : 'Aroma Material',
        amountGrams: 10,
        noteType: 'heart'
      }
    ]);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'materialId') {
        const mat = materials.find(m => m.id === value);
        return { ...item, materialId: value, materialName: mat ? mat.name : item.materialName };
      }
      return { ...item, [field]: value };
    }));
  };

  // Live Calculations for the modal
  const concentrateGrams = ingredients
    .filter(i => i.noteType !== 'carrier')
    .reduce((sum, i) => sum + (parseFloat(i.amountGrams.toString()) || 0), 0);

  const carrierGrams = ingredients
    .filter(i => i.noteType === 'carrier')
    .reduce((sum, i) => sum + (parseFloat(i.amountGrams.toString()) || 0), 0);

  const totalFormulaGrams = concentrateGrams + carrierGrams;
  const calculatedConcentration = totalFormulaGrams > 0 ? (concentrateGrams / totalFormulaGrams) * 100 : 0;
  const bottleYield = Math.max(1, Math.round(batchVolumeMl / 50));

  const formulaBatchCost = ingredients.reduce((sum, ing) => {
    const mat = materials.find(m => m.id === ing.materialId);
    const unitPrice = mat ? mat.costPerUnit : 0;
    return sum + (parseFloat(ing.amountGrams.toString()) || 0) * unitPrice;
  }, 0);

  const unitOilCost = bottleYield > 0 ? formulaBatchCost / bottleYield : 0;
  const estimatedUnitCogs = unitOilCost + bottleMaterialCost;
  const netProfit = manualPrice - estimatedUnitCogs;
  const grossMargin = manualPrice > 0 ? (netProfit / manualPrice) * 100 : 0;

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addRecipe({
      name: name.trim(),
      tagline: tagline.trim() || 'Artisan bespoke formulation',
      concentration,
      batchVolumeMl,
      maturationDaysNeeded: maturationDays,
      ingredients,
      bottleMaterialCost,
      manualPrice,
      bottlesYield: bottleYield,
      pyramid: {
        top: topNotes.split(',').map(s => s.trim()).filter(Boolean),
        heart: heartNotes.split(',').map(s => s.trim()).filter(Boolean),
        base: baseNotes.split(',').map(s => s.trim()).filter(Boolean)
      }
    });

    setShowModal(false);
    showNotification(`New Perfume "${name}" saved to formulation library!`);
  };

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Top Banner */}
      <div className="card-luxury rounded-3xl p-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 font-mono uppercase tracking-wide">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            Formula & Recipe Lab
          </h2>
          <p className="text-[11px] text-stone-400 font-sans mt-0.5">
            Bespoke formulations, note pyramids & batch scaling
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-glow-amber px-3.5 py-2 rounded-2xl text-xs font-bold font-mono flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Perfume</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center font-bold animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Recipe Cards List */}
      <div className="space-y-3.5">
        {recipes.length === 0 ? (
          <div className="card-luxury rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <FlaskConical className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-extrabold text-white font-serif-luxury uppercase tracking-wider">
              No Formulas Created Yet
            </h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto font-sans leading-relaxed">
              Your formulation laboratory is ready. Tap "+ New Recipe" above to compose your first fragrance pyramid, oils, and pricing.
            </p>
          </div>
        ) : (
          recipes.map(recipe => {
          const { oilCost, packCost, totalCogs, concentrationPercent } = calculateRecipeCogs(recipe);
          const profit = recipe.manualPrice - totalCogs;
          const margin = recipe.manualPrice > 0 ? (profit / recipe.manualPrice) * 100 : 0;

          return (
            <div
              key={recipe.id}
              className="card-luxury card-luxury-hover rounded-3xl p-4.5 space-y-3.5"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white font-serif-luxury tracking-wide truncate">
                      {recipe.name}
                    </h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25 shrink-0">
                      {recipe.concentration}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 italic mt-0.5 font-sans truncate">
                    "{recipe.tagline}"
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold font-mono text-amber-300">
                    ₹{recipe.manualPrice.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    50ml Standard
                  </span>
                </div>
              </div>

              {/* Scent Pyramid Breakdown */}
              <div className="bg-[#14100d] p-3 rounded-2xl border border-amber-500/15 space-y-1.5 text-xs font-mono">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold text-[9px] uppercase tracking-wider w-12 shrink-0 pt-0.5">Top:</span>
                  <span className="text-stone-300 font-sans text-xs leading-tight">{recipe.pyramid.top.join(' • ')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold text-[9px] uppercase tracking-wider w-12 shrink-0 pt-0.5">Heart:</span>
                  <span className="text-stone-300 font-sans text-xs leading-tight">{recipe.pyramid.heart.join(' • ')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold text-[9px] uppercase tracking-wider w-12 shrink-0 pt-0.5">Base:</span>
                  <span className="text-stone-300 font-sans text-xs leading-tight">{recipe.pyramid.base.join(' • ')}</span>
                </div>
              </div>

              {/* Financial & Formulation Telemetry (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 text-center font-mono">
                <div className="bg-[#1b1510] p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-stone-500 block uppercase">Liquid Cost</span>
                  <span className="text-xs font-bold text-stone-200">₹{Math.round(oilCost)}</span>
                </div>
                <div className="bg-[#1b1510] p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-stone-500 block uppercase">Pack Cost</span>
                  <span className="text-xs font-bold text-stone-200">₹{packCost}</span>
                </div>
                <div className="bg-[#1b1510] p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-amber-500/80 block uppercase">Unit COGS</span>
                  <span className="text-xs font-bold text-amber-400">₹{Math.round(totalCogs)}</span>
                </div>
                <div className="bg-[#1b1510] p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-emerald-500/80 block uppercase">Net Margin</span>
                  <span className="text-xs font-bold text-emerald-400">{margin.toFixed(0)}%</span>
                </div>
              </div>

              {/* Sizing Tiers Available */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-mono">
                <span className="text-stone-500 uppercase text-[9px] font-bold shrink-0">Sizes:</span>
                {(recipe.sizes && recipe.sizes.length > 0 ? recipe.sizes : [
                  { sizeMl: 15, price: Math.round(recipe.manualPrice * 0.42 / 50) * 50 - 1 },
                  { sizeMl: 30, price: Math.round(recipe.manualPrice * 0.68 / 50) * 50 - 1 },
                  { sizeMl: 50, price: recipe.manualPrice },
                  { sizeMl: 100, price: Math.round(recipe.manualPrice * 1.72 / 50) * 50 - 1 }
                ]).map(size => (
                  <span
                    key={size.sizeMl}
                    className="px-2.5 py-1 rounded-full bg-[#14100d] text-stone-300 border border-amber-500/20 shrink-0"
                  >
                    <strong className="text-amber-300 font-bold">{size.sizeMl}ml</strong>: ₹{size.price.toLocaleString('en-IN')}
                  </span>
                ))}
              </div>

              {/* Formulation Ingredients Summary */}
              <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-[#221a14] pt-2 font-mono">
                <span>{recipe.ingredients.length} formula oils • {recipe.maturationDaysNeeded}d aging</span>
                <span className="text-amber-300 font-semibold">{recipe.inStockBottles} bottles ready</span>
              </div>

              {/* Batch Scaler & Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#221a14]">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <Scale className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="text-stone-500">Scale:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        scaleRecipe(recipe.id, 50);
                        showNotification(`Scaled ${recipe.name} to 50ml trial blend`);
                      }}
                      className={`px-2 py-0.5 rounded-lg border transition text-[10px] ${
                        recipe.batchVolumeMl === 50 ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'border-amber-500/20 text-stone-400 hover:text-white'
                      }`}
                    >
                      50ml
                    </button>
                    <button
                      onClick={() => {
                        scaleRecipe(recipe.id, 500);
                        showNotification(`Scaled ${recipe.name} to 500ml (10 bottles)`);
                      }}
                      className={`px-2 py-0.5 rounded-lg border transition text-[10px] ${
                        recipe.batchVolumeMl === 500 ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'border-amber-500/20 text-stone-400 hover:text-white'
                      }`}
                    >
                      500ml
                    </button>
                    <button
                      onClick={() => {
                        scaleRecipe(recipe.id, 1000);
                        showNotification(`Scaled ${recipe.name} to 1000ml (20 bottles)`);
                      }}
                      className={`px-2 py-0.5 rounded-lg border transition text-[10px] ${
                        recipe.batchVolumeMl === 1000 ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'border-amber-500/20 text-stone-400 hover:text-white'
                      }`}
                    >
                      1000ml
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRecipeId(recipe.id);
                    setActiveTab('pricing');
                  }}
                  className="px-3 py-1.5 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] text-amber-300 text-xs font-mono font-semibold border border-amber-500/25 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <span>Pricing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Full Modal: Create New Perfume */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="card-luxury rounded-3xl p-5 max-w-md w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl my-auto animate-scaleUp no-scrollbar border-amber-500/30">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#221a14] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    New Perfume Formulation
                  </h3>
                  <p className="text-[10px] text-stone-400 font-sans">
                    Store recipe, ingredients & calculate unit COGS in INR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-white text-xs font-mono font-bold px-2 py-1 rounded-xl bg-[#14100d]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-3.5 text-xs font-mono">
              {/* Perfume Identity */}
              <div className="space-y-2">
                <div>
                  <label className="text-stone-400 text-[11px] block mb-1">Perfume Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oudh & Cashmere Noir"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div>
                  <label className="text-stone-400 text-[11px] block mb-1">Fragrance Tagline / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Smoky Assam oud with creamy cashmere and bourbon vanilla"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                  />
                </div>
              </div>

              {/* Concentration & Batch Setup */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-stone-400 text-[10px] block mb-1">Concentration</label>
                  <select
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-2 py-2 text-white text-[11px] outline-none focus:border-amber-400"
                  >
                    <option value="Extrait de Parfum (24%)">Extrait (24%)</option>
                    <option value="Extrait de Parfum (20%)">Extrait (20%)</option>
                    <option value="Eau de Parfum (18%)">EDP (18%)</option>
                    <option value="Eau de Parfum (15%)">EDP (15%)</option>
                    <option value="Eau de Toilette (10%)">EDT (10%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 text-[10px] block mb-1">Batch Volume</label>
                  <select
                    value={batchVolumeMl}
                    onChange={(e) => setBatchVolumeMl(parseInt(e.target.value))}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-2 py-2 text-white text-[11px] outline-none focus:border-amber-400"
                  >
                    <option value="50">50ml (1 bottle)</option>
                    <option value="250">250ml (5 bottles)</option>
                    <option value="500">500ml (10 bottles)</option>
                    <option value="1000">1000ml (20 bottles)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 text-[10px] block mb-1">Aging Days</label>
                  <input
                    type="number"
                    value={maturationDays}
                    onChange={(e) => setMaturationDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-2 py-2 text-white text-[11px] outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Recipe Ingredients Table */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5" />
                    Composition ({ingredients.length} items)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-[10px] text-black font-bold bg-amber-400 hover:bg-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-0.5"
                  >
                    + Add Material
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-[#14100d] border border-amber-500/15 flex items-center gap-1.5 text-[11px]"
                    >
                      {/* Material Selector */}
                      <select
                        value={ing.materialId}
                        onChange={(e) => handleIngredientChange(idx, 'materialId', e.target.value)}
                        className="flex-1 bg-[#1b1510] border border-amber-500/20 rounded-xl px-2 py-1 text-white text-[11px] truncate outline-none"
                      >
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (₹{m.costPerUnit}/{m.unit})
                          </option>
                        ))}
                      </select>

                      {/* Weight (grams) */}
                      <div className="w-16">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="g"
                          value={ing.amountGrams}
                          onChange={(e) => handleIngredientChange(idx, 'amountGrams', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#1b1510] border border-amber-500/20 rounded-xl px-1.5 py-1 text-white text-center text-[11px] outline-none font-bold font-mono"
                        />
                      </div>

                      {/* Note Category */}
                      <select
                        value={ing.noteType}
                        onChange={(e) => handleIngredientChange(idx, 'noteType', e.target.value)}
                        className="w-20 bg-[#1b1510] border border-amber-500/20 rounded-xl px-1 py-1 text-stone-300 text-[10px] outline-none"
                      >
                        <option value="top">Top Note</option>
                        <option value="heart">Heart Note</option>
                        <option value="base">Base Note</option>
                        <option value="carrier">Carrier</option>
                      </select>

                      {/* Delete row */}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="p-1 text-stone-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scent Pyramid Breakdown */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-stone-400 uppercase font-bold">Olfactory Pyramid (For Storefront)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="text"
                    placeholder="Top (e.g. Bergamot)"
                    value={topNotes}
                    onChange={(e) => setTopNotes(e.target.value)}
                    className="bg-[#14100d] border border-amber-500/20 rounded-2xl px-2.5 py-1.5 text-[11px] text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Heart (e.g. Rose)"
                    value={heartNotes}
                    onChange={(e) => setHeartNotes(e.target.value)}
                    className="bg-[#14100d] border border-amber-500/20 rounded-2xl px-2.5 py-1.5 text-[11px] text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Base (e.g. Amber)"
                    value={baseNotes}
                    onChange={(e) => setBaseNotes(e.target.value)}
                    className="bg-[#14100d] border border-amber-500/20 rounded-2xl px-2.5 py-1.5 text-[11px] text-white outline-none"
                  />
                </div>
              </div>

              {/* Packaging & Direct Selling Price in INR */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-stone-400 text-[10px] block mb-1">Packaging Cost / Bottle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-500 text-xs font-mono">₹</span>
                    <input
                      type="number"
                      value={bottleMaterialCost}
                      onChange={(e) => setBottleMaterialCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl pl-7 pr-2 py-1.5 text-white outline-none font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-amber-400 text-[10px] block mb-1 font-bold">Selling Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-amber-400 font-bold text-xs font-mono">₹</span>
                    <input
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#14100d] border border-amber-500/40 rounded-2xl pl-7 pr-2 py-1.5 text-amber-300 outline-none font-bold text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Live Formulation Telemetry Box */}
              <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/20 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400">Total Concentrate:</span>
                  <span className="text-amber-300 font-bold">{concentrateGrams}g ({calculatedConcentration.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400">Unit COGS:</span>
                  <span className="text-white font-bold font-mono">₹{Math.round(estimatedUnitCogs)} / bottle</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#221a14]">
                  <span className="text-emerald-400 font-bold">Net Profit per Bottle:</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    ₹{Math.round(netProfit)} ({grossMargin.toFixed(1)}% margin)
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 font-bold border border-amber-500/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-glow-amber py-2.5 rounded-2xl font-extrabold uppercase"
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
