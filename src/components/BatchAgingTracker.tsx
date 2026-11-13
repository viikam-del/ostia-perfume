import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Batch, ProductionStage } from '../types';
import {
  Hourglass,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Tag,
  AlertTriangle,
  Layers,
  Printer,
  Share2,
  Settings,
  ChevronRight,
  Clock,
  ArrowRight,
  Check,
  Bell
} from 'lucide-react';
import { BottleTagGenerator } from './BottleTagGenerator';

export const BatchAgingTracker: React.FC = () => {
  const {
    batches,
    recipes,
    brewBatch,
    bottleBatch,
    productionStages,
    updateProductionStage,
    advanceBatchStage,
    shareBatchReminder,
    productionStats,
    profile
  } = useApp();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [batchNum, setBatchNum] = useState(`Batch #${String(batches.length + 1).padStart(2, '0')}`);
  const [bottlesPlanned, setBottlesPlanned] = useState(10);
  const [initialStageId, setInitialStageId] = useState('compounding');
  const [notes, setNotes] = useState('');
  
  // Advance Stage Modal
  const [advanceModalBatch, setAdvanceModalBatch] = useState<Batch | null>(null);
  const [stageNotes, setStageNotes] = useState('');

  // Active Tag Batch
  const [activeTagBatch, setActiveTagBatch] = useState<Batch | null>(null);

  // Filter state for pipeline
  const [filterStage, setFilterStage] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleStartBrew = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    const res = brewBatch({
      batchNumber: batchNum,
      recipeId: recipe.id,
      recipeName: recipe.name,
      brewDate: new Date().toISOString().split('T')[0],
      targetDays: recipe.maturationDaysNeeded,
      bottlesPlanned: bottlesPlanned,
      currentStageId: initialStageId,
      notes: notes.trim() || `Brewed 500ml batch of ${recipe.name}.`
    });

    if (res.success) {
      setShowNewModal(false);
      setNotes('');
      showToast('success', res.message);
    } else {
      showToast('info', res.message);
    }
  };

  const handleShareReminder = async (batchId: string) => {
    const res = await shareBatchReminder(batchId);
    if (res.shared) {
      showToast('success', 'Production alert copied / shared! Ready to paste into Notes, Reminders, or WhatsApp.');
    }
  };

  const handleConfirmAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceModalBatch) return;

    const currentIndex = productionStages.findIndex(s => s.id === advanceModalBatch.currentStageId);
    if (currentIndex < productionStages.length - 1) {
      const nextStage = productionStages[currentIndex + 1];
      const res = advanceBatchStage(advanceModalBatch.id, nextStage.id, stageNotes.trim() || undefined);
      showToast('success', res.message);
    }
    setAdvanceModalBatch(null);
    setStageNotes('');
  };

  const filteredBatches = batches.filter(b => {
    if (filterStage === 'all') return true;
    if (filterStage === 'active') return b.currentStageId !== 'stocked';
    if (filterStage === 'stocked') return b.currentStageId === 'stocked';
    return b.currentStageId === filterStage;
  });

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* 4 PRODUCTION TELEMETRY TILES (Symmetrical 2x2 Mobile Grid) */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="card-luxury rounded-3xl p-3">
          <span className="text-[9px] text-stone-400 uppercase font-bold block font-mono">Total Made</span>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">
            {productionStats.totalMadeAllTime}
          </div>
          <span className="text-[9px] text-stone-500 block font-sans">All-Time Yield</span>
        </div>

        <div className="card-luxury rounded-3xl p-3 border-amber-500/30">
          <span className="text-[9px] text-amber-400 uppercase font-bold block font-mono">In Production</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1 font-mono">
            {productionStats.inProductionCount}
          </div>
          <span className="text-[9px] text-amber-500/70 block font-sans">WIP Flacons</span>
        </div>

        <div className="card-luxury rounded-3xl p-3 border-orange-500/30">
          <span className="text-[9px] text-orange-400 uppercase font-bold block font-mono">Ready Stock</span>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">
            {productionStats.finishedStockCount}
          </div>
          <span className="text-[9px] text-stone-400 block font-sans">On-Shelf Bottles</span>
        </div>

        <div className="card-luxury rounded-3xl p-3 border-emerald-500/30">
          <span className="text-[9px] text-emerald-400 uppercase font-bold block font-mono">Delivered</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
            {productionStats.bottlesSoldCount}
          </div>
          <span className="text-[9px] text-emerald-500/70 block font-sans">Sold & Shipped</span>
        </div>
      </div>

      {/* Main Header with Actions */}
      <div className="card-luxury rounded-3xl p-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide font-mono">
            <Hourglass className="w-4 h-4 text-amber-400" />
            Maturation Pipeline & Stock
          </h2>
          <p className="text-[11px] text-stone-400 font-sans mt-0.5">
            7-stage artisan timeline & maceration progress
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowStageSettings(true)}
            title="Configure Production Stages"
            className="p-2 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 border border-amber-500/20 text-xs flex items-center gap-1 active:scale-95 transition"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] hidden sm:inline font-mono">Stages</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="btn-glow-amber px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Batch</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold text-center font-mono animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Visual Production Pipeline Stepper Bar */}
      <div className="card-luxury rounded-3xl p-3.5 space-y-2">
        <div className="flex justify-between items-center text-[10px] px-1 text-stone-400 font-mono">
          <span className="uppercase font-bold text-amber-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> 7 Production Milestones
          </span>
          <span>Tap to filter</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {productionStages.map((stage, idx) => {
            const countInStage = batches.filter(b => b.currentStageId === stage.id).length;
            const isSelected = filterStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setFilterStage(isSelected ? 'all' : stage.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all shrink-0 min-w-20 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                    : countInStage > 0
                    ? 'bg-[#18130e] border-amber-500/30 text-stone-200'
                    : 'bg-[#120e0a] border-[#221a14] text-stone-500'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span>0{idx + 1}</span>
                  {countInStage > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
                        isSelected ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {countInStage}
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-bold font-mono truncate mt-0.5">
                  {stage.shortCode}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Mode Selector */}
      <div className="flex gap-1.5 bg-[#14100d] p-1.5 rounded-full border border-amber-500/20 text-xs font-mono">
        <button
          onClick={() => setFilterStage('all')}
          className={`flex-1 py-1.5 rounded-full font-bold transition-all text-xs ${
            filterStage === 'all' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
          }`}
        >
          All ({batches.length})
        </button>
        <button
          onClick={() => setFilterStage('active')}
          className={`flex-1 py-1.5 rounded-full font-bold transition-all text-xs ${
            filterStage === 'active' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
          }`}
        >
          In Progress ({batches.filter(b => b.currentStageId !== 'stocked').length})
        </button>
        <button
          onClick={() => setFilterStage('stocked')}
          className={`flex-1 py-1.5 rounded-full font-bold transition-all text-xs ${
            filterStage === 'stocked' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
          }`}
        >
          Stocked ({batches.filter(b => b.currentStageId === 'stocked').length})
        </button>
      </div>

      {/* Batches Cards in Production */}
      <div className="space-y-3.5">
        {filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-stone-500 card-luxury rounded-3xl border-dashed text-xs">
            No batches at this production stage.
          </div>
        ) : (
          filteredBatches.map(batch => {
            const currentStage = productionStages.find(s => s.id === batch.currentStageId) || productionStages[0];
            const currentStageIndex = productionStages.findIndex(s => s.id === batch.currentStageId);
            const isCompletedStock = batch.currentStageId === 'stocked';
            const progressPercent = Math.round(((currentStageIndex + 1) / productionStages.length) * 100);

            return (
              <div
                key={batch.id}
                className={`card-luxury rounded-3xl p-4 transition-all space-y-3 ${
                  isCompletedStock
                    ? 'border-[#221a14] opacity-85'
                    : 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white font-mono">{batch.batchNumber}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentStage.color}`}
                      >
                        Stage {currentStageIndex + 1}/7: {currentStage.name}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-amber-200 mt-1 font-serif-luxury truncate">{batch.recipeName}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-amber-300 font-mono">
                      {batch.bottlesPlanned} Flacons
                    </span>
                    <span className="text-[10px] text-stone-400 block font-mono">
                      Yield: {batch.bottlesPlanned * 50}ml
                    </span>
                  </div>
                </div>

                {/* Production Stage Stepper Bar */}
                <div className="space-y-1 my-1">
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>Progress: {progressPercent}%</span>
                    <span>
                      {isCompletedStock
                        ? '100% In Stock'
                        : batch.stageDueDate
                        ? `Due: ${batch.stageDueDate}`
                        : 'Active Milestone'}
                    </span>
                  </div>
                  <div className="w-full bg-[#14100d] h-2 rounded-full overflow-hidden flex border border-[#221a14]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompletedStock ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stage Info & Notes */}
                <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 text-[11px] space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span className="text-stone-400 font-mono">Current Task:</span>
                    <strong className="text-amber-300">{currentStage.description}</strong>
                  </div>
                  {batch.stageNotes && (
                    <div className="text-stone-400 italic pt-1 border-t border-[#221a14] font-sans">
                      "{batch.stageNotes}"
                    </div>
                  )}
                </div>

                {/* Action Bar: Advance Stage, Share Reminder, Print Tags */}
                <div className="pt-2 border-t border-[#221a14] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Share Reminder Button */}
                    <button
                      onClick={() => handleShareReminder(batch.id)}
                      className="w-full py-2 px-2.5 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] text-stone-300 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-amber-500/20 active:scale-95 transition font-mono"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Reminder</span>
                    </button>

                    {/* Print Tags Button */}
                    <button
                      onClick={() => setActiveTagBatch(batch)}
                      className="w-full py-2 px-2.5 rounded-2xl bg-[#14100d] hover:bg-[#1e1711] text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-amber-500/30 active:scale-95 transition font-mono"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Bottle Tags</span>
                    </button>
                  </div>

                  {/* Advance to Next Stage Button */}
                  {!isCompletedStock ? (
                    <button
                      onClick={() => setAdvanceModalBatch(batch)}
                      className="w-full btn-glow-amber py-2.5 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 uppercase font-mono"
                    >
                      <span>
                        Advance to {productionStages[currentStageIndex + 1]?.name || 'Next Stage'} &rarr;
                      </span>
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Ready in Stock ({batch.bottlesPlanned} Flacons)
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Advance Stage */}
      {advanceModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="card-luxury rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border-amber-500/30">
            <div className="flex justify-between items-center border-b border-[#221a14] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                <ArrowRight className="w-4 h-4 text-amber-400" />
                Advance Production Stage
              </h3>
              <button
                onClick={() => setAdvanceModalBatch(null)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdvance} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 space-y-1">
                <div className="text-stone-400 text-[10px] uppercase font-mono">Batch:</div>
                <div className="text-white font-bold font-serif-luxury">{advanceModalBatch.batchNumber} • {advanceModalBatch.recipeName}</div>
                <div className="text-amber-300 text-[11px] pt-1 font-mono">
                  Moving from [
                  {productionStages.find(s => s.id === advanceModalBatch.currentStageId)?.name}
                  ] &rarr; [
                  {productionStages[productionStages.findIndex(s => s.id === advanceModalBatch.currentStageId) + 1]?.name}
                  ]
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-mono">Stage Tasting & QC Notes</label>
                <textarea
                  rows={2}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="e.g. Filtered crystal clear. Chilled for 24h. No precipitate."
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdvanceModalBatch(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#14100d] text-stone-300 font-bold border border-amber-500/15 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-glow-amber py-2.5 rounded-2xl font-extrabold uppercase font-mono"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customize Stages */}
      {showStageSettings && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="card-luxury rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl my-6 border-amber-500/30">
            <div className="flex justify-between items-center border-b border-[#221a14] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                <Settings className="w-4 h-4 text-amber-400" />
                Customize Production Stages
              </h3>
              <button
                onClick={() => setShowStageSettings(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-stone-400 font-sans">
              Configure your bespoke studio workflow stages and typical maturation durations:
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {productionStages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/15 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400 font-mono">
                      0{idx + 1}. {stage.shortCode}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                      <span>Duration:</span>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={stage.typicalDays}
                        onChange={(e) => updateProductionStage(stage.id, { typicalDays: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-[#1b1510] border border-amber-500/30 rounded-xl px-1.5 py-0.5 text-center text-white font-bold"
                      />
                      <span>days</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateProductionStage(stage.id, { name: e.target.value })}
                    className="w-full bg-[#1b1510] border border-amber-500/20 rounded-xl px-2.5 py-1 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    value={stage.description}
                    onChange={(e) => updateProductionStage(stage.id, { description: e.target.value })}
                    className="w-full bg-[#1b1510] border border-amber-500/20 rounded-xl px-2.5 py-1 text-stone-400 text-[10px] font-sans"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowStageSettings(false);
                showToast('success', 'Production stages and durations updated!');
              }}
              className="w-full btn-glow-amber py-2.5 rounded-2xl font-extrabold text-xs uppercase font-mono"
            >
              Done & Save Stages
            </button>
          </div>
        </div>
      )}

      {/* New Batch Brew Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="card-luxury rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border-amber-500/30">
            <div className="flex justify-between items-center border-b border-[#221a14] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Initiate Production Batch
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartBrew} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1 font-mono">Batch Code</label>
                <input
                  type="text"
                  value={batchNum}
                  onChange={(e) => setBatchNum(e.target.value)}
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-mono">Fragrance Formulation</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                >
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.maturationDaysNeeded} days maturation)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 block mb-1 font-mono">Planned Bottles</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bottlesPlanned}
                    onChange={(e) => setBottlesPlanned(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-mono">Starting Stage</label>
                  <select
                    value={initialStageId}
                    onChange={(e) => setInitialStageId(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-2 py-2 text-white outline-none focus:border-amber-400 text-[11px]"
                  >
                    {productionStages.slice(0, 3).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-mono">Batch Formulation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cold extraction batch. Stored in dark amber jug."
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#14100d] text-stone-300 font-bold border border-amber-500/15 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-glow-amber py-2.5 rounded-2xl font-extrabold uppercase font-mono"
                >
                  Start Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottle Tag Generator Modal */}
      {activeTagBatch && (
        <BottleTagGenerator
          batch={activeTagBatch}
          onClose={() => setActiveTagBatch(null)}
        />
      )}
    </div>
  );
};
