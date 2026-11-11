import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, QrCode, CheckCircle, Copy, Check, ChevronRight, ShieldCheck, Tag, Box, CheckSquare, Plus } from 'lucide-react';

export const CustomerStorefront: React.FC = () => {
  const { profile, recipes, addOrder, discoveryConfig } = useApp();
  const [storeMode, setStoreMode] = useState<'flacons' | 'discovery'>('flacons');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  
  // Discovery Box Selections (Up to 3 items)
  const [selectedDiscoveryIds, setSelectedDiscoveryIds] = useState<string[]>([
    recipes[0]?.id || '',
    recipes[1]?.id || '',
    recipes[2]?.id || ''
  ].filter(Boolean));

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderNumber: string;
    recipeName: string;
    bottleSerial: string;
    price: number;
    discoveryItems?: string[];
  } | null>(null);
  
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [confirmedTransfer, setConfirmedTransfer] = useState(false);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  const toggleDiscoveryItem = (recipeId: string) => {
    if (selectedDiscoveryIds.includes(recipeId)) {
      if (selectedDiscoveryIds.length > 1) {
        setSelectedDiscoveryIds(prev => prev.filter(id => id !== recipeId));
      }
    } else {
      if (selectedDiscoveryIds.length < (discoveryConfig.vialCount || 3)) {
        setSelectedDiscoveryIds(prev => [...prev, recipeId]);
      } else {
        // Replace last item
        setSelectedDiscoveryIds(prev => [...prev.slice(0, (discoveryConfig.vialCount || 3) - 1), recipeId]);
      }
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (storeMode === 'discovery') {
      const selectedNames = selectedDiscoveryIds
        .map(id => recipes.find(r => r.id === id)?.name)
        .filter(Boolean) as string[];

      const orderNumber = addOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        deliveryNote: deliveryNote.trim(),
        orderType: 'discovery_set',
        recipeId: 'discovery',
        recipeName: `Discovery Sampler Box (${discoveryConfig.vialCount} × ${discoveryConfig.vialSizeMl}ml)`,
        discoveryItems: selectedNames,
        bottleSerial: `Discovery Box #${Math.floor(100 + Math.random() * 900)}`,
        price: discoveryConfig.price,
        paymentMethod: 'UPI',
        status: 'Pending Payment'
      });

      setSubmittedOrder({
        orderNumber,
        recipeName: `Discovery Sampler Box (${discoveryConfig.vialCount} × ${discoveryConfig.vialSizeMl}ml)`,
        bottleSerial: 'Custom Curated Discovery Box',
        price: discoveryConfig.price,
        discoveryItems: selectedNames
      });
    } else {
      if (!selectedRecipe) return;
      const totalYield = selectedRecipe.bottlesYield || 10;
      const remaining = selectedRecipe.inStockBottles;
      const serialNum = Math.max(1, totalYield - remaining + 1);
      const bottleSerial = `Bottle ${String(serialNum).padStart(2, '0')} of ${totalYield}`;

      const orderNumber = addOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        deliveryNote: deliveryNote.trim(),
        orderType: 'full_bottle',
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        bottleSerial,
        price: selectedRecipe.manualPrice,
        paymentMethod: 'UPI',
        status: 'Pending Payment'
      });

      setSubmittedOrder({
        orderNumber,
        recipeName: selectedRecipe.name,
        bottleSerial,
        price: selectedRecipe.manualPrice
      });
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(profile.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 pt-2 font-mono">
      {/* Brand Hero */}
      <div className="text-center space-y-2 py-3 px-2">
        <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-xl">
          <div className="w-full h-full bg-[#0b0e14] rounded-2xl flex items-center justify-center text-amber-300 font-serif-luxury font-bold text-2xl">
            O
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-widest font-serif-luxury uppercase">
          {profile.businessName}
        </h2>
        <p className="text-xs text-amber-400/90 max-w-xs mx-auto italic font-sans font-medium">
          {profile.tagline}
        </p>
      </div>

      {/* Store Navigation: 50ml Flacons vs Discovery Box */}
      <div className="flex gap-2 bg-[#10141e] p-1.5 rounded-2xl border border-[#1e2536] text-xs">
        <button
          onClick={() => setStoreMode('flacons')}
          className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
            storeMode === 'flacons'
              ? 'bg-amber-400 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>50ml Flacons</span>
        </button>
        <button
          onClick={() => setStoreMode('discovery')}
          className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
            storeMode === 'discovery'
              ? 'bg-amber-400 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Discovery Box ({profile.currency}{discoveryConfig.price})</span>
        </button>
      </div>

      {submittedOrder ? (
        /* Order Confirmed & On-Screen UPI QR */
        <div className="bg-[#10141e] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
              {submittedOrder.discoveryItems ? 'Discovery Box Reserved!' : 'Flacon Reserved!'}
            </h3>
            <p className="text-xs text-gray-300 font-sans">
              Logged under order <strong className="text-white">{submittedOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="bg-[#080a0f] p-3.5 rounded-2xl border border-[#1e2536] space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Item:</span>
              <strong className="text-amber-300">{submittedOrder.recipeName}</strong>
            </div>

            {submittedOrder.discoveryItems ? (
              <div className="pt-1.5 border-t border-[#1a2130]">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Curated 5ml Vials:</span>
                <ul className="space-y-0.5 text-white font-semibold">
                  {submittedOrder.discoveryItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-1 text-[11px]">
                      <span className="text-amber-400">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex justify-between text-gray-300">
                <span>Edition Serial:</span>
                <span className="font-bold text-white">{submittedOrder.bottleSerial}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-300 pt-1.5 border-t border-[#1a2130] font-bold text-sm">
              <span>Total Payable:</span>
              <span className="text-emerald-400">{profile.currency}{submittedOrder.price.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* On-Screen Direct UPI QR Code */}
          <div className="bg-white p-4 rounded-2xl text-center space-y-3 text-black">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
              Scan & Pay via Any UPI App
            </div>
            
            <div className="w-44 h-44 mx-auto bg-gray-50 border-2 border-black/10 rounded-xl p-2.5 flex items-center justify-center">
              <QrCode className="w-full h-full text-black" />
            </div>

            <div className="bg-gray-100 rounded-xl p-2 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">{profile.upiId}</span>
              <button
                onClick={copyUpi}
                className="px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedUpi ? 'Copied' : 'Copy VPA'}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-sans">
              Exact Amount: <strong>₹{submittedOrder.price.toLocaleString('en-IN')}</strong>
            </p>
          </div>

          {confirmedTransfer ? (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Transfer Recorded! The perfumer has received your reservation.
            </div>
          ) : (
            <button
              onClick={() => setConfirmedTransfer(true)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 uppercase tracking-wide"
            >
              <CheckCircle className="w-4 h-4" />
              I have transferred {profile.currency}{submittedOrder.price.toLocaleString('en-IN')}
            </button>
          )}

          <button
            onClick={() => {
              setSubmittedOrder(null);
              setConfirmedTransfer(false);
            }}
            className="w-full text-center text-xs text-gray-400 hover:text-white pt-1 underline"
          >
            ← Order another item
          </button>
        </div>
      ) : storeMode === 'discovery' ? (
        /* DISCOVERY SAMPLER SET BUILDER */
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-amber-500/40 rounded-3xl p-4.5 space-y-3 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  Boutique Sampler Box
                </span>
                <h3 className="text-base font-extrabold text-white mt-1 font-serif-luxury">
                  Custom Discovery Set (3 × 5ml)
                </h3>
                <p className="text-xs text-gray-400 italic mt-0.5 font-sans">
                  Choose any 3 bespoke fragrances to sample before ordering a full flacon.
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-amber-400">
                  {profile.currency}{discoveryConfig.price}
                </span>
                <span className="text-[9px] text-gray-400 block font-mono">Free shipping</span>
              </div>
            </div>

            {/* 3 Interactive Slots */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-between">
                <span>Selected Sample Vials ({selectedDiscoveryIds.length}/3)</span>
                {selectedDiscoveryIds.length === 3 && (
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[9px]">
                    <Check className="w-3 h-3" /> Box Complete
                  </span>
                )}
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map(slotIdx => {
                  const recipeId = selectedDiscoveryIds[slotIdx];
                  const recipe = recipes.find(r => r.id === recipeId);

                  return (
                    <div
                      key={slotIdx}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        recipe
                          ? 'bg-[#181f2e] border-amber-500/50 text-white'
                          : 'bg-[#080a0f] border-dashed border-[#222a3d] text-gray-500'
                      }`}
                    >
                      <span className="text-[8px] text-amber-400/80 uppercase font-bold block">
                        Vial 0{slotIdx + 1} (5ml)
                      </span>
                      <span className="text-[11px] font-bold truncate block mt-0.5">
                        {recipe ? recipe.name.split('&')[0].trim() : 'Select Below'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fragrance Selector Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Tap to Add / Swap Samples
            </span>

            <div className="space-y-2">
              {recipes.map(recipe => {
                const isSelected = selectedDiscoveryIds.includes(recipe.id);

                return (
                  <div
                    key={recipe.id}
                    onClick={() => toggleDiscoveryItem(recipe.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#151c2a] border-amber-500 text-white shadow-md'
                        : 'bg-[#10141e] border-[#1e2536] text-gray-300 hover:border-[#2b354d]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{recipe.name}</span>
                        <span className="text-[9px] text-amber-300 font-mono">
                          {recipe.concentration.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                        Top: {recipe.pyramid.top[0]} • Heart: {recipe.pyramid.heart[0]} • Base: {recipe.pyramid.base[0]}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'border-[#2d3547] text-gray-500'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout Form for Discovery Box */}
          <form onSubmit={handlePlaceOrder} className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              Recipient & Delivery Details
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore / Mumbai"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedDiscoveryIds.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 mt-2 uppercase tracking-wide disabled:opacity-50"
            >
              <span>Order Discovery Box ({profile.currency}{discoveryConfig.price})</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        </div>
      ) : (
        /* 50ML FLACONS VIEW */
        <div className="space-y-4">
          <div className="space-y-3">
            {recipes.map(recipe => {
              const isSelected = selectedRecipeId === recipe.id;
              const isAvailable = recipe.inStockBottles > 0;

              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipeId(recipe.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141824] border-amber-500/60 shadow-lg'
                      : 'bg-[#10141e] border-[#1e2536] hover:border-[#2b354d]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        {recipe.concentration}
                      </span>
                      <h3 className="text-sm font-extrabold text-white mt-1.5 font-serif-luxury tracking-wide">
                        {recipe.name}
                      </h3>
                      <p className="text-xs text-gray-400 italic mt-0.5 font-sans">
                        "{recipe.tagline}"
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-amber-300">
                        {profile.currency}{recipe.manualPrice.toLocaleString('en-IN')}
                      </div>
                      <span className={`text-[10px] font-bold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isAvailable ? `${recipe.inStockBottles} in stock` : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  {/* Scent Pyramid Tags */}
                  <div className="mt-3 pt-2.5 border-t border-[#1c2230] grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="bg-[#080a0f] p-2 rounded-xl border border-[#1a2130]">
                      <span className="text-amber-400 font-bold block uppercase text-[9px]">Top</span>
                      <span className="text-gray-300 truncate block">{recipe.pyramid.top[0]}</span>
                    </div>
                    <div className="bg-[#080a0f] p-2 rounded-xl border border-[#1a2130]">
                      <span className="text-pink-400 font-bold block uppercase text-[9px]">Heart</span>
                      <span className="text-gray-300 truncate block">{recipe.pyramid.heart[0]}</span>
                    </div>
                    <div className="bg-[#080a0f] p-2 rounded-xl border border-[#1a2130]">
                      <span className="text-amber-500 font-bold block uppercase text-[9px]">Base</span>
                      <span className="text-gray-300 truncate block">{recipe.pyramid.base[0]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Reservation Form */}
          <form onSubmit={handlePlaceOrder} className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Reserve Flacon ({selectedRecipe?.name})
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Singhania"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Delivery Address or Note</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Bengaluru / Pickup"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 mt-2 uppercase tracking-wide"
            >
              <span>Reserve & View UPI QR ({profile.currency}{selectedRecipe?.manualPrice.toLocaleString('en-IN')})</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
