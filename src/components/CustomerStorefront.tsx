import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, QrCode, CheckCircle, Copy, Check, ChevronRight, ShieldCheck } from 'lucide-react';

export const CustomerStorefront: React.FC = () => {
  const { profile, recipes, addOrder } = useApp();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderNumber: string;
    recipeName: string;
    bottleSerial: string;
    price: number;
  } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [confirmedTransfer, setConfirmedTransfer] = useState(false);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedRecipe) return;

    // Generate bottle serial
    const totalYield = selectedRecipe.bottlesYield || 10;
    const remaining = selectedRecipe.inStockBottles;
    const serialNum = Math.max(1, totalYield - remaining + 1);
    const bottleSerial = `Bottle ${String(serialNum).padStart(2, '0')} of ${totalYield}`;

    const orderNumber = addOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      deliveryNote: deliveryNote.trim(),
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
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(profile.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-16 pt-2">
      {/* Brand Hero Banner */}
      <div className="text-center space-y-2 py-4 px-2">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-xl">
          <div className="w-full h-full bg-[#12151c] rounded-full flex items-center justify-center text-amber-300 font-serif-luxury font-bold text-xl">
            {profile.businessName.charAt(0)}
          </div>
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide font-serif-luxury">
          {profile.businessName}
        </h2>
        <p className="text-xs text-amber-400/90 max-w-xs mx-auto italic font-medium">
          {profile.tagline}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-semibold">
          <Sparkles className="w-3 h-3" />
          Handmade Micro-Batches • 50ml Flacons
        </div>
      </div>

      {submittedOrder ? (
        /* Order Confirmed & On-Screen Payment QR */
        <div className="bg-[#171b24] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-serif-luxury">
              Flacon Reserved!
            </h3>
            <p className="text-xs text-gray-300">
              Your bottle has been logged under <strong className="text-white">{submittedOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="bg-[#12151c] p-3.5 rounded-2xl border border-[#262c3b] space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Fragrance:</span>
              <strong className="text-amber-300">{submittedOrder.recipeName}</strong>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Collector Edition:</span>
              <span className="font-mono text-white">{submittedOrder.bottleSerial}</span>
            </div>
            <div className="flex justify-between text-gray-300 pt-1 border-t border-[#252b38] font-bold">
              <span>Total Payable:</span>
              <span className="text-emerald-400 font-mono text-sm">{profile.currency}{submittedOrder.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Direct UPI QR Code on Screen */}
          <div className="bg-white p-4 rounded-2xl text-center space-y-3 text-black">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Scan to Pay via Any UPI App
            </div>
            
            {/* Visual Crisp SVG QR */}
            <div className="w-40 h-40 mx-auto bg-gray-50 border-2 border-black/10 rounded-xl p-2 flex items-center justify-center">
              <QrCode className="w-full h-full text-black" />
            </div>

            <div className="bg-gray-100 rounded-xl p-2 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-800">{profile.upiId}</span>
              <button
                onClick={copyUpi}
                className="px-2 py-1 rounded bg-black text-white text-[10px] font-semibold flex items-center gap-1 active:scale-95 transition"
              >
                {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedUpi ? 'Copied' : 'Copy UPI'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Supported: GPay, PhonePe, Paytm, or direct bank UPI.
            </p>
          </div>

          {/* Self-Verification Button */}
          {confirmedTransfer ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Payment Confirmed! The perfumer has received your notification.
            </div>
          ) : (
            <button
              onClick={() => setConfirmedTransfer(true)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              I have transferred {profile.currency}{submittedOrder.price} via UPI / Cash
            </button>
          )}

          <button
            onClick={() => {
              setSubmittedOrder(null);
              setConfirmedTransfer(false);
            }}
            className="w-full text-center text-xs text-gray-400 hover:text-white pt-1 underline"
          >
            ← Order another bottle
          </button>
        </div>
      ) : (
        /* Scent Catalog & Order Form */
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
                      ? 'bg-[#1b1f2b] border-amber-500/60 shadow-lg'
                      : 'bg-[#171b24] border-[#252a36] hover:border-[#353c4d]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {recipe.concentration}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1 font-serif-luxury">
                        {recipe.name}
                      </h3>
                      <p className="text-xs text-gray-400 italic mt-0.5">"{recipe.tagline}"</p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-amber-300">
                        {profile.currency}{recipe.manualPrice.toFixed(2)}
                      </div>
                      <span className={`text-[10px] font-semibold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isAvailable ? `${recipe.inStockBottles} bottles left` : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  {/* Scent Pyramid Tags */}
                  <div className="mt-3 pt-2 border-t border-[#262c3b] grid grid-cols-3 gap-1 text-[10px]">
                    <div className="bg-[#12151c] p-1.5 rounded-lg border border-[#252b38]">
                      <span className="text-amber-400 font-bold block">Top</span>
                      <span className="text-gray-300 truncate block">{recipe.pyramid.top[0]}</span>
                    </div>
                    <div className="bg-[#12151c] p-1.5 rounded-lg border border-[#252b38]">
                      <span className="text-pink-400 font-bold block">Heart</span>
                      <span className="text-gray-300 truncate block">{recipe.pyramid.heart[0]}</span>
                    </div>
                    <div className="bg-[#12151c] p-1.5 rounded-lg border border-[#252b38]">
                      <span className="text-amber-500 font-bold block">Base</span>
                      <span className="text-gray-300 truncate block">{recipe.pyramid.base[0]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Reservation Form */}
          <form onSubmit={handlePlaceOrder} className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Reserve Your Bespoke Bottle
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
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Delivery Address or Note</label>
                <input
                  type="text"
                  placeholder="e.g. Handover at office / Bangalore"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full bg-[#12151c] border border-[#2d3446] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Reserve & Pay ({profile.currency}{selectedRecipe?.manualPrice})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-gray-500 text-center">
              Direct UPI QR code will appear immediately upon submission.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};
