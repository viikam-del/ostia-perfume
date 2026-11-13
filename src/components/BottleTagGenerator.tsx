import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Batch } from '../types';
import { Printer, Tag, Sparkles, Check, Download, ShieldCheck, QrCode } from 'lucide-react';

interface BottleTagGeneratorProps {
  batch: Batch;
  onClose: () => void;
}

export const BottleTagGenerator: React.FC<BottleTagGeneratorProps> = ({ batch, onClose }) => {
  const { recipes, profile } = useApp();
  const recipe = recipes.find(r => r.id === batch.recipeId);
  const [selectedBottleNum, setSelectedBottleNum] = useState<number>(1);
  const [selectedSizeMl, setSelectedSizeMl] = useState<number>(50);
  const totalBottles = batch.bottlesPlanned || 10;

  const sizeOptions = [
    { sizeMl: 15, label: '15ml', oz: '0.5 FL. OZ.' },
    { sizeMl: 30, label: '30ml', oz: '1.0 FL. OZ.' },
    { sizeMl: 50, label: '50ml', oz: '1.7 FL. OZ.' },
    { sizeMl: 100, label: '100ml', oz: '3.4 FL. OZ.' }
  ];

  const currentSizeOption = sizeOptions.find(s => s.sizeMl === selectedSizeMl) || sizeOptions[2];
  const currentSerial = `Bottle ${String(selectedBottleNum).padStart(2, '0')} of ${String(totalBottles).padStart(2, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-[#0b0e14] border border-[#222a3d] rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl my-6 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#1c2230] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wide">
                Flacon Collar Tag & Certificate
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                {batch.batchNumber} • {batch.recipeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xs font-mono font-bold px-2 py-1 rounded-lg bg-[#141824]"
          >
            ✕
          </button>
        </div>

        {/* Bottle Serial & Size Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-[#121622] p-2.5 rounded-xl border border-[#1e2536] text-xs font-mono">
            <span className="text-gray-400">Bottle Number:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[220px] py-0.5 no-scrollbar">
              {Array.from({ length: totalBottles }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedBottleNum(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition shrink-0 ${
                    selectedBottleNum === num
                      ? 'bg-amber-400 text-black border border-amber-300 shadow-sm'
                      : 'bg-[#181f2d] text-gray-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#121622] p-2.5 rounded-xl border border-[#1e2536] text-xs font-mono">
            <span className="text-gray-400">Flacon Size:</span>
            <div className="flex items-center gap-1.5">
              {sizeOptions.map(opt => (
                <button
                  key={opt.sizeMl}
                  onClick={() => setSelectedSizeMl(opt.sizeMl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    selectedSizeMl === opt.sizeMl
                      ? 'bg-amber-400 text-black border border-amber-300 shadow-sm'
                      : 'bg-[#181f2d] text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.sizeMl}ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Physical Printable Collar Tag Preview */}
        <div className="p-3 bg-[#06080c] rounded-2xl border border-[#1a2130] flex justify-center">
          {/* Printable Tag Container (Collar Neck Format) */}
          <div
            id="printable-collar-tag"
            className="w-full max-w-sm bg-gradient-to-b from-[#161a24] via-[#10141e] to-[#0a0d14] text-white p-5 rounded-2xl border-2 border-amber-500/40 shadow-2xl relative space-y-4 print:border-black print:text-black print:bg-white"
          >
            {/* Top Collar Hole Indicator (Cutout guide for neck string) */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center text-[8px] text-amber-400 font-mono select-none">
                ✂
              </div>
              <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5 font-mono">
                Flacon Neck Loop
              </span>
            </div>

            {/* Atelier Brand Emblem */}
            <div className="text-center space-y-1">
              <img
                src="/ostia-logo.png"
                alt="OSTIA Logo"
                className="w-16 h-16 mx-auto object-contain filter drop-shadow my-1"
              />
              <div className="text-amber-400 font-serif-luxury text-sm font-bold tracking-[0.25em] uppercase">
                {profile.businessName}
              </div>
              <div className="text-[9px] text-amber-300/80 tracking-widest uppercase font-mono">
                Haute Parfumerie • {profile.perfumerName}
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto my-1"></div>
            </div>

            {/* Fragrance Name & Concentration */}
            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-white font-serif-luxury tracking-wide">
                {batch.recipeName}
              </h4>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono border border-amber-500/30">
                {recipe?.concentration || 'Extrait de Parfum'}
              </span>
              <p className="text-[10px] text-gray-400 italic font-sans max-w-xs mx-auto">
                "{recipe?.tagline}"
              </p>
            </div>

            {/* Limited Edition Serialization Badge */}
            <div className="bg-[#0b0e14] border border-amber-500/30 rounded-xl p-2.5 text-center font-mono">
              <div className="text-[9px] text-gray-500 uppercase tracking-widest">
                Certificate of Authenticity
              </div>
              <div className="text-sm font-extrabold text-amber-400 tracking-wider my-0.5">
                {currentSerial}
              </div>
              <div className="text-[10px] text-gray-400 flex justify-center gap-3 mt-1 pt-1 border-t border-[#1a2130]">
                <span>{batch.batchNumber}</span>
                <span>•</span>
                <span>{selectedSizeMl}ml Flacon ({currentSizeOption.oz})</span>
                <span>•</span>
                <span>{batch.targetDays} Days Matured</span>
              </div>
            </div>

            {/* Olfactory Scent Pyramid */}
            {recipe?.pyramid && (
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="p-1.5 rounded-lg bg-[#080a0f] border border-[#1a2130]">
                  <span className="text-amber-400 font-bold block text-[8px] uppercase">Top Notes (Opening)</span>
                  <span className="text-gray-300 block">{recipe.pyramid.top.join(' • ')}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[#080a0f] border border-[#1a2130]">
                  <span className="text-pink-400 font-bold block text-[8px] uppercase">Heart Notes (Core)</span>
                  <span className="text-gray-300 block">{recipe.pyramid.heart.join(' • ')}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[#080a0f] border border-[#1a2130]">
                  <span className="text-amber-500 font-bold block text-[8px] uppercase">Base Notes (Drydown)</span>
                  <span className="text-gray-300 block">{recipe.pyramid.base.join(' • ')}</span>
                </div>
              </div>
            )}

            {/* Artisan Seal & Date */}
            <div className="pt-2 border-t border-amber-500/20 flex justify-between items-end text-[9px] font-mono text-gray-400">
              <div>
                <span className="block text-gray-500">Master Perfumer</span>
                <span className="text-amber-300 font-serif-luxury font-bold text-xs">{profile.perfumerName}</span>
              </div>
              <div className="text-right">
                <span className="block text-gray-500">Brewed on</span>
                <span className="text-gray-300">{batch.brewDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 font-mono">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Collar Tag ({currentSerial})</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-gray-300 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
