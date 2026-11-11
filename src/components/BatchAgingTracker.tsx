import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Hourglass, Plus, CheckCircle2, Calendar, Sparkles, Tag, AlertCircle } from 'lucide-react';

export const BatchAgingTracker: React.FC = () => {
  const { batches, recipes, addBatch, updateBatchStatus } = useApp();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [batchNum, setBatchNum] = useState(`Batch #${String(batches.length + 1).padStart(2, '0')}`);
  const [bottlesPlanned, setBottlesPlanned] = useState(10);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    addBatch({
      batchNumber: batchNum,
      recipeId: recipe.id,
      recipeName: recipe.name,
      brewDate: new Date().toISOString().split('T')[0],
      targetDays: recipe.maturationDaysNeeded,
      bottlesPlanned: bottlesPlanned,
      bottlesBottled: 0,
      status: 'macerating',
      notes: notes || `Brewed 500ml batch of ${recipe.name}.`
    });

    setShowNewModal(false);
    setNotes('');
    showFeedback(`${batchNum} created! Aging timer started.`);
  };

  const getDaysPassed = (brewDateStr: string) => {
    const brewTime = new Date(brewDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - brewTime) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-[#171b24] border border-[#262c3b] rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif-luxury">
            <Hourglass className="w-4 h-4 text-amber-400" />
            Maceration & Aging Batches
          </h2>
          <p className="text-[11px] text-gray-400">Track perfume maturation & bottle numbering</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Brew Batch</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Batches List */}
      <div className="space-y-3">
        {batches.map(batch => {
          const daysPassed = getDaysPassed(batch.brewDate);
          const percent = Math.min(100, Math.round((daysPassed / batch.targetDays) * 100));
          const isReady = daysPassed >= batch.targetDays || batch.status === 'ready_to_bottle';
          const isBottled = batch.status === 'bottled';

          return (
            <div
              key={batch.id}
              className={`p-4 rounded-2xl border transition-all ${
                isBottled
                  ? 'bg-[#14171f] border-[#252a36] opacity-75'
                  : isReady
                  ? 'bg-[#17201b] border-emerald-500/40 shadow-sm'
                  : 'bg-[#171b24] border-[#293040]'
              }`}
            >
              {/* Card Title */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{batch.batchNumber}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isBottled
                          ? 'bg-gray-800 text-gray-400 border-gray-700'
                          : isReady
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isBottled ? '✓ Bottled & In Stock' : isReady ? '★ Ready to Bottle' : 'Macerating'}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-200 mt-0.5">{batch.recipeName}</h3>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-amber-400">
                    Day {daysPassed} / {batch.targetDays}
                  </div>
                  <div className="text-[10px] text-gray-400">{percent}% Matured</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#12151c] h-2 rounded-full overflow-hidden border border-[#252b38] my-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBottled ? 'bg-gray-600' : isReady ? 'bg-emerald-400' : 'bg-amber-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Batch Info & Notes */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  Brewed: {batch.brewDate}
                </span>
                <span>Planned: {batch.bottlesPlanned} bottles (50ml)</span>
              </div>

              {batch.notes && (
                <p className="text-[11px] text-gray-400 italic mt-2 bg-[#12151c] p-2 rounded-lg border border-[#252b38]">
                  "{batch.notes}"
                </p>
              )}

              {/* Action Buttons */}
              {!isBottled && (
                <div className="pt-3 mt-3 border-t border-[#252a36] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      showFeedback(`Serial codes: Bottle 01 of ${batch.bottlesPlanned} to ${batch.bottlesPlanned} of ${batch.bottlesPlanned} for ${batch.batchNumber}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1e2330] hover:bg-[#262c3d] text-gray-300 text-[11px] font-medium flex items-center gap-1 border border-[#2d3446]"
                  >
                    <Tag className="w-3 h-3 text-amber-400" />
                    Preview Bottle Serials
                  </button>

                  <button
                    onClick={() => {
                      updateBatchStatus(batch.id, 'bottled');
                      showFeedback(`Marked ${batch.batchNumber} as bottled! Added ${batch.bottlesPlanned} bottles to stock.`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Bottled (+{batch.bottlesPlanned} Stock)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Batch Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171b24] border border-[#2d3446] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif-luxury">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Brew New Batch
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Batch Number / Label</label>
                <input
                  type="text"
                  value={batchNum}
                  onChange={(e) => setBatchNum(e.target.value)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Select Fragrance Formulation</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                >
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.maturationDaysNeeded} days maturation)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Bottles Planned (50ml each)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bottlesPlanned}
                  onChange={(e) => setBottlesPlanned(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Maker Notes / Batch Tweaks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Added +0.5g Bergamot, keep at 18°C"
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#1e2330] text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-sm"
                >
                  Start Aging
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
