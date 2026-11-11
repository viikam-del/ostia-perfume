import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Clock, Plus, CheckCircle, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { RoadmapFeature } from '../types';

export const RoadmapTracker: React.FC = () => {
  const { roadmap, toggleRoadmapStatus } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<RoadmapFeature['category']>('Recipe Engine');
  const [showAddModal, setShowAddModal] = useState(false);

  const completedCount = roadmap.filter(f => f.status === 'completed').length;
  const inProgressCount = roadmap.filter(f => f.status === 'in_progress').length;
  const plannedCount = roadmap.filter(f => f.status === 'planned').length;
  const progressPercent = Math.round((completedCount / roadmap.length) * 100);

  const filteredFeatures = roadmap.filter(f => {
    if (filter === 'completed') return f.status === 'completed';
    if (filter === 'in_progress') return f.status === 'in_progress';
    if (filter === 'planned') return f.status === 'planned';
    return true;
  });

  return (
    <div className="space-y-4 pb-20 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            Ostia Feature Roadmap & Progress
          </h2>
          <p className="text-[11px] text-gray-400">
            Methodically tracking capabilities requested by the perfumer
          </p>
        </div>
      </div>

      {/* Progress Telemetry Card */}
      <div className="bg-gradient-to-r from-[#121622] to-[#0c0f17] border border-[#1e2536] rounded-2xl p-4 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Overall Feature Implementation
          </span>
          <span className="font-extrabold text-amber-400">
            {completedCount} / {roadmap.length} Delivered ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#080a0f] h-2.5 rounded-full overflow-hidden flex border border-[#1a2130]">
          <div
            className="bg-emerald-400 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${Math.round((inProgressCount / roadmap.length) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 pt-1">
          <span className="text-emerald-400 font-bold">✓ {completedCount} Completed</span>
          <span className="text-amber-400 font-bold">⚡ {inProgressCount} In Progress</span>
          <span className="text-cyan-400 font-bold">✦ {plannedCount} Planned</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-[#10141e] p-1.5 rounded-xl border border-[#1e2536] text-[11px]">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'all' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          All ({roadmap.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'completed' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Done ({completedCount})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'in_progress' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Active ({inProgressCount})
        </button>
        <button
          onClick={() => setFilter('planned')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'planned' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Queue ({plannedCount})
        </button>
      </div>

      {/* Feature Items List */}
      <div className="space-y-2.5">
        {filteredFeatures.map(item => {
          const isDone = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';

          return (
            <div
              key={item.id}
              onClick={() => toggleRoadmapStatus(item.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                isDone
                  ? 'bg-[#0e141a] border-emerald-500/30 hover:border-emerald-500/50'
                  : isInProgress
                  ? 'bg-[#141219] border-amber-500/40 hover:border-amber-500/60'
                  : 'bg-[#10141e] border-[#1e2536] hover:border-[#2b354d]'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : isInProgress
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-[#080a0f] border-gray-600 text-transparent'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-gray-200'}`}>
                        {item.title}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161a26] text-gray-400 border border-[#222a3d]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-sans leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isInProgress
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {isDone ? '✓ Completed' : isInProgress ? '⚡ In Progress' : '✦ Planned'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 text-center text-[10px] text-gray-500">
        💡 Tap any feature card to cycle its status (Completed ⇄ In Progress ⇄ Planned)
      </div>
    </div>
  );
};
