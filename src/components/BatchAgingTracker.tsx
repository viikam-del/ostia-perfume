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
      advanceBatchStage(advanceModalBatch.id, nextStage.id, stageNotes);
      showToast('success', `${advanceModalBatch.batchNumber} advanced to [${nextStage.name}]!`);
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
    <div className="space-y-4 pb-20 font-mono">
      {/* 4 PRODUCTION TELEMETRY TILES */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        <div className="bg-[#10141e] border border-[#1e2536] p-2 rounded-2xl">
          <span className="text-[9px] text-gray-500 uppercase font-bold block">Total Made</span>
          <div className="text-base font-extrabold text-white mt-0.5">
            {productionStats.totalMadeAllTime}
          </div>
          <span className="text-[8px] text-gray-400 block">All-Time</span>
        </div>

        <div className="bg-[#10141e] border border-amber-500/30 p-2 rounded-2xl">
          <span className="text-[9px] text-amber-400 uppercase font-bold block">In Production</span>
          <div className="text-base font-extrabold text-amber-400 mt-0.5">
            {productionStats.inProductionCount}
          </div>
          <span className="text-[8px] text-gray-400 block">WIP Flacons</span>
        </div>

        <div className="bg-[#10141e] border border-cyan-500/30 p-2 rounded-2xl">
          <span className="text-[9px] text-cyan-400 uppercase font-bold block">Ready Stock</span>
          <div className="text-base font-extrabold text-cyan-400 mt-0.5">
            {productionStats.finishedStockCount}
          </div>
          <span className="text-[8px] text-gray-400 block">On-Shelf</span>
        </div>

        <div className="bg-[#10141e] border border-emerald-500/30 p-2 rounded-2xl">
          <span className="text-[9px] text-emerald-400 uppercase font-bold block">Delivered</span>
          <div className="text-base font-extrabold text-emerald-400 mt-0.5">
            {productionStats.bottlesSoldCount}
          </div>
          <span className="text-[8px] text-gray-400 block">Sold</span>
        </div>
      </div>

      {/* Main Header with Actions */}
      <div className="flex justify-between items-center bg-[#10141e] border border-[#1e2536] rounded-2xl p-3.5 shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Hourglass className="w-4 h-4 text-amber-400" />
            Production Stages & Stock Tracker
          </h2>
          <p className="text-[11px] text-gray-400">
            Multi-stage pipeline, stage due reminders & stock counts
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowStageSettings(true)}
            title="Configure Production Stages"
            className="p-2 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-gray-300 border border-[#222a3d] text-xs flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] hidden sm:inline">Set Stages</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Batch</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold text-center animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Visual Production Pipeline Stepper Bar */}
      <div className="bg-[#0b0e14] border border-[#1c2230] p-2.5 rounded-2xl overflow-x-auto space-y-1.5">
        <div className="flex justify-between items-center text-[10px] px-1 text-gray-400">
          <span className="uppercase font-bold text-amber-400 flex items-center gap-1">
            <Layers className="w-3 h-3" /> 7 Production Milestones
          </span>
          <span>Tap to filter batches</span>
        </div>

        <div className="flex items-center gap-1 min-w-[580px] py-1">
          {productionStages.map((stage, idx) => {
            const countInStage = batches.filter(b => b.currentStageId === stage.id).length;
            const isSelected = filterStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setFilterStage(isSelected ? 'all' : stage.id)}
                className={`flex-1 p-2 rounded-xl border text-left transition relative ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md font-bold'
                    : countInStage > 0
                    ? 'bg-[#141926] border-amber-500/40 text-gray-200'
                    : 'bg-[#0e121a] border-[#1e2536] text-gray-500'
                }`}
              >
                <div className="flex justify-between items-center text-[9px]">
                  <span>0{idx + 1}</span>
                  {countInStage > 0 && (
                    <span
                      className={`px-1.5 rounded-full text-[8px] font-bold ${
                        isSelected ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {countInStage}
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-bold truncate mt-0.5">
                  {stage.shortCode}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Mode Selector */}
      <div className="flex gap-1.5 bg-[#10141e] p-1.5 rounded-xl border border-[#1e2536] text-xs">
        <button
          onClick={() => setFilterStage('all')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filterStage === 'all' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          All Batches ({batches.length})
        </button>
        <button
          onClick={() => setFilterStage('active')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filterStage === 'active' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          In Progress ({batches.filter(b => b.currentStageId !== 'stocked').length})
        </button>
        <button
          onClick={() => setFilterStage('stocked')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filterStage === 'stocked' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Stocked ({batches.filter(b => b.currentStageId === 'stocked').length})
        </button>
      </div>

      {/* Batches Cards in Production */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-[#10141e] rounded-2xl border border-[#1e2536] text-xs">
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
                className={`p-4 rounded-2xl border transition-all ${
                  isCompletedStock
                    ? 'bg-[#0c0f16] border-[#181e2b] opacity-85'
                    : 'bg-[#10141e] border-amber-500/30 shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{batch.batchNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentStage.color}`}
                      >
                        Stage {currentStageIndex + 1}/7: {currentStage.name}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-200 mt-1">{batch.recipeName}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-400">
                      {batch.bottlesPlanned} Flacons
                    </span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      Yield: {batch.bottlesPlanned * 50}ml
                    </span>
                  </div>
                </div>

                {/* Production Stage Stepper Bar */}
                <div className="space-y-1 my-2">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Pipeline Progress: {progressPercent}%</span>
                    <span>
                      {isCompletedStock
                        ? '100% In Stock'
                        : batch.stageDueDate
                        ? `Due: ${batch.stageDueDate}`
                        : 'Action Pending'}
                    </span>
                  </div>
                  <div className="w-full bg-[#080a0f] h-2 rounded-full overflow-hidden flex border border-[#1a2130]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompletedStock ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stage Info & Notes */}
                <div className="p-2.5 rounded-xl bg-[#080a0f] border border-[#181f2d] text-[11px] space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Current Milestone:</span>
                    <strong className="text-amber-300">{currentStage.description}</strong>
                  </div>
                  {batch.stageNotes && (
                    <div className="text-gray-400 italic pt-1 border-t border-[#181f2d] font-sans">
                      "{batch.stageNotes}"
                    </div>
                  )}
                </div>

                {/* Action Bar: Advance Stage, Share Reminder, Print Tags */}
                <div className="pt-3 mt-3 border-t border-[#1c2230] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Share Reminder Button */}
                    <button
                      onClick={() => handleShareReminder(batch.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-gray-300 text-[11px] font-bold flex items-center gap-1 border border-[#222a3d] active:scale-95 transition"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Share Reminder</span>
                    </button>

                    {/* Print Tags Button */}
                    <button
                      onClick={() => setActiveTagBatch(batch)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/30 active:scale-95 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tags</span>
                    </button>
                  </div>

                  {/* Advance to Next Stage Button */}
                  {!isCompletedStock ? (
                    <button
                      onClick={() => setAdvanceModalBatch(batch)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition"
                    >
                      <span>
                        Advance &rarr; {productionStages[currentStageIndex + 1]?.shortCode || 'Next'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Ready in Stock
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Advance Stage */}
      {advanceModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-[#0e121a] border border-[#222a3d] rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1c2230] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                <ArrowRight className="w-4 h-4 text-amber-400" />
                Advance Production Stage
              </h3>
              <button
                onClick={() => setAdvanceModalBatch(null)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdvance} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#080a0f] border border-[#1e2536] space-y-1">
                <div className="text-gray-400 text-[10px] uppercase">Batch:</div>
                <div className="text-white font-bold">{advanceModalBatch.batchNumber} • {advanceModalBatch.recipeName}</div>
                <div className="text-amber-400 text-[11px] pt-1">
                  Moving from [
                  {productionStages.find(s => s.id === advanceModalBatch.currentStageId)?.name}
                  ] &rarr; [
                  {productionStages[productionStages.findIndex(s => s.id === advanceModalBatch.currentStageId) + 1]?.name}
                  ]
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Stage Tasting & QC Notes</label>
                <textarea
                  rows={2}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="e.g. Filtered crystal clear. Chilled for 24h. No precipitate."
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdvanceModalBatch(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#141824] text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-md shadow-amber-500/20"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customize Stages ("Stages can be set") */}
      {showStageSettings && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0e121a] border border-[#222a3d] rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl my-6 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1c2230] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                <Settings className="w-4 h-4 text-amber-400" />
                Customize Production Stages
              </h3>
              <button
                onClick={() => setShowStageSettings(false)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Configure your bespoke studio workflow stages and typical maturation durations:
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {productionStages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="p-3 rounded-2xl bg-[#080a0f] border border-[#1e2536] space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400">
                      0{idx + 1}. {stage.shortCode}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <span>Duration:</span>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={stage.typicalDays}
                        onChange={(e) => updateProductionStage(stage.id, { typicalDays: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-[#141824] border border-[#222a3d] rounded-lg px-1.5 py-0.5 text-center text-white font-bold"
                      />
                      <span>days</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateProductionStage(stage.id, { name: e.target.value })}
                    className="w-full bg-[#141824] border border-[#222a3d] rounded-lg px-2 py-1 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    value={stage.description}
                    onChange={(e) => updateProductionStage(stage.id, { description: e.target.value })}
                    className="w-full bg-[#141824] border border-[#222a3d] rounded-lg px-2 py-1 text-gray-400 text-[10px] font-sans"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowStageSettings(false);
                showToast('success', 'Production stages and durations updated!');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-md shadow-amber-500/20"
            >
              Done & Save Stages
            </button>
          </div>
        </div>
      )}

      {/* New Batch Brew Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-[#0e121a] border border-[#222a3d] rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1c2230] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Initiate Production Batch
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartBrew} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Batch Code</label>
                <input
                  type="text"
                  value={batchNum}
                  onChange={(e) => setBatchNum(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Select Fragrance Formulation</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
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
                  <label className="text-gray-400 block mb-1">Planned Bottles</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bottlesPlanned}
                    onChange={(e) => setBottlesPlanned(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Starting Stage</label>
                  <select
                    value={initialStageId}
                    onChange={(e) => setInitialStageId(e.target.value)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-2 py-2 text-white outline-none focus:border-amber-400 text-[11px]"
                  >
                    {productionStages.slice(0, 3).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Batch Formulation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cold extraction batch. Stored in dark amber jug."
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#141824] text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-md shadow-amber-500/20"
                >
                  Start Production
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
