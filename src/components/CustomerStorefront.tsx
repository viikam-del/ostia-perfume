import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '../types';
import {
  Sparkles,
  CheckCircle,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Box,
  ArrowLeft,
  Phone,
  User,
  MapPin,
  ExternalLink,
  Gift,
  Banknote,
  Clock,
  RotateCcw
} from 'lucide-react';

export const CustomerStorefront: React.FC = () => {
  const { profile, recipes, addOrder, updateOrderStatus, discoveryConfig } = useApp();

  // Multi-step checkout funnel state
  const [checkoutStep, setCheckoutStep] = useState<'catalog' | 'details' | 'confirmation' | 'order_received'>('catalog');
  
  // Selection
  const [selectedProductType, setSelectedProductType] = useState<'flacon' | 'discovery'>('flacon');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [catalogCategory, setCatalogCategory] = useState<'flacons' | 'discovery'>('flacons');

  // Discovery selections (up to 3 items)
  const [selectedDiscoveryIds, setSelectedDiscoveryIds] = useState<string[]>([
    recipes[0]?.id || '',
    recipes[1]?.id || '',
    recipes[2]?.id || ''
  ].filter(Boolean));

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [giftNote, setGiftNote] = useState('');

  // Confirmation / Payment state
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  // Order received state
  const [orderCompleteData, setOrderCompleteData] = useState<{
    orderNumber: string;
    paymentMethod: 'UPI' | 'Cash';
    customerName: string;
    price: number;
    bottleSerial: string;
    recipeName: string;
    discoveryItems?: string[];
    deliveryNote: string;
  } | null>(null);

  const [redirectCountdown, setRedirectCountdown] = useState<number>(6);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  // Auto-redirect countdown effect on order completion
  useEffect(() => {
    if (checkoutStep !== 'order_received') return;

    if (redirectCountdown <= 0) {
      resetToCatalog();
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkoutStep, redirectCountdown]);

  const resetToCatalog = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setGiftNote('');
    setSubmittedOrder(null);
    setOrderCompleteData(null);
    setRedirectCountdown(6);
    setCheckoutStep('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Choose product from catalog and move to details page
  const handleSelectFlacon = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setSelectedProductType('flacon');
    setCheckoutStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDiscovery = () => {
    setSelectedProductType('discovery');
    setCheckoutStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle discovery box sample scents
  const toggleDiscoveryItem = (recipeId: string) => {
    if (selectedDiscoveryIds.includes(recipeId)) {
      if (selectedDiscoveryIds.length > 1) {
        setSelectedDiscoveryIds(prev => prev.filter(id => id !== recipeId));
      }
    } else {
      if (selectedDiscoveryIds.length < (discoveryConfig.vialCount || 3)) {
        setSelectedDiscoveryIds(prev => [...prev, recipeId]);
      } else {
        setSelectedDiscoveryIds(prev => [...prev.slice(0, (discoveryConfig.vialCount || 3) - 1), recipeId]);
      }
    }
  };

  // 2. Submit form on details page and move to confirmation/payment page
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    if (selectedProductType === 'discovery') {
      const selectedNames = selectedDiscoveryIds
        .map(id => recipes.find(r => r.id === id)?.name)
        .filter(Boolean) as string[];

      const combinedNote = [
        deliveryAddress.trim(),
        deliveryMethod === 'pickup' ? '[Personal Handover / Pickup]' : '[Doorstep Delivery]',
        giftNote.trim() ? `Gift Note: "${giftNote.trim()}"` : ''
      ].filter(Boolean).join(' • ');

      const createdOrder = addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryNote: combinedNote,
        orderType: 'discovery_set',
        recipeId: 'discovery',
        recipeName: `Discovery Sampler Box (${discoveryConfig.vialCount} × ${discoveryConfig.vialSizeMl}ml)`,
        discoveryItems: selectedNames,
        bottleSerial: `Discovery Box #${Math.floor(100 + Math.random() * 900)}`,
        price: discoveryConfig.price,
        paymentMethod: 'Pending',
        status: 'Pending Payment'
      });

      setSubmittedOrder(createdOrder);
    } else {
      if (!selectedRecipe) return;

      const totalYield = selectedRecipe.bottlesYield || 10;
      const remaining = selectedRecipe.inStockBottles;
      const serialNum = Math.max(1, totalYield - remaining + 1);
      const bottleSerial = `Bottle ${String(serialNum).padStart(2, '0')} of ${totalYield}`;

      const combinedNote = [
        deliveryAddress.trim(),
        deliveryMethod === 'pickup' ? '[Personal Handover / Pickup]' : '[Doorstep Delivery]',
        giftNote.trim() ? `Gift Note: "${giftNote.trim()}"` : ''
      ].filter(Boolean).join(' • ');

      const createdOrder = addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryNote: combinedNote,
        orderType: 'full_bottle',
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        bottleSerial,
        price: selectedRecipe.manualPrice,
        paymentMethod: 'Pending',
        status: 'Pending Payment'
      });

      setSubmittedOrder(createdOrder);
    }

    setCheckoutStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. User chooses payment method: Paid via UPI vs Pay with Cash
  const handlePaymentConfirm = (method: 'UPI' | 'Cash') => {
    if (!submittedOrder) return;

    if (method === 'UPI') {
      updateOrderStatus(submittedOrder.id, 'Paid', 'UPI');
    } else {
      updateOrderStatus(submittedOrder.id, 'Pending Payment', 'Cash');
    }

    setOrderCompleteData({
      orderNumber: submittedOrder.orderNumber,
      paymentMethod: method,
      customerName: customerName.trim() || 'Valued Collector',
      price: submittedOrder.price,
      bottleSerial: submittedOrder.bottleSerial,
      recipeName: submittedOrder.recipeName,
      discoveryItems: submittedOrder.discoveryItems,
      deliveryNote: submittedOrder.deliveryNote
    });

    setRedirectCountdown(6);
    setCheckoutStep('order_received');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(profile.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const payablePrice = selectedProductType === 'discovery' ? discoveryConfig.price : (selectedRecipe?.manualPrice || 0);

  // Standard NPCI UPI URI string
  const upiUri = submittedOrder
    ? `upi://pay?pa=${encodeURIComponent(profile.upiId)}&pn=${encodeURIComponent(profile.businessName || 'Ostia')}&am=${submittedOrder.price}&cu=INR&tn=${encodeURIComponent(submittedOrder.orderNumber)}`
    : '';

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 pt-1 font-mono">
      {/* Brand Hero (Shown on catalog & details) */}
      {checkoutStep !== 'confirmation' && checkoutStep !== 'order_received' && (
        <div className="text-center space-y-2 py-3 px-2">
          <div className="w-24 h-24 mx-auto rounded-3xl p-1 flex items-center justify-center">
            <img
              src="/ostia-logo.png"
              alt="OSTIA Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(217,119,6,0.3)]"
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-[0.25em] font-serif-luxury uppercase">
              {profile.businessName}
            </h2>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-0.5">
              Haute Parfumerie • Master Perfumer {profile.perfumerName}
            </div>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto italic font-sans mt-1">
              {profile.tagline}
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 1: SCENT CATALOG & PRODUCT SELECTION                     */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'catalog' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Category Pills: 50ml Flacons vs Discovery Box */}
          <div className="flex gap-2 bg-[#10141e] p-1.5 rounded-2xl border border-[#1e2536] text-xs">
            <button
              onClick={() => setCatalogCategory('flacons')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                catalogCategory === 'flacons'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>50ml Flacons</span>
            </button>
            <button
              onClick={() => setCatalogCategory('discovery')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                catalogCategory === 'discovery'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Discovery Box ({profile.currency}{discoveryConfig.price})</span>
            </button>
          </div>

          {/* 50ml Flacons List */}
          {catalogCategory === 'flacons' ? (
            <div className="space-y-3">
              {recipes.map(recipe => {
                const isAvailable = recipe.inStockBottles > 0;

                return (
                  <div
                    key={recipe.id}
                    className="bg-[#10141e] border border-[#1e2536] hover:border-[#2f3950] rounded-3xl p-4.5 space-y-3 transition shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          {recipe.concentration}
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-1.5 font-serif-luxury tracking-wide">
                          {recipe.name}
                        </h3>
                        <p className="text-xs text-gray-400 italic mt-0.5 font-sans">
                          "{recipe.tagline}"
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-extrabold text-amber-300">
                          {profile.currency}{recipe.manualPrice.toLocaleString('en-IN')}
                        </div>
                        <span className={`text-[10px] font-bold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isAvailable ? `${recipe.inStockBottles} in stock` : 'Sold Out'}
                        </span>
                      </div>
                    </div>

                    {/* Scent Pyramid Tags */}
                    <div className="pt-2 border-t border-[#1c2230] grid grid-cols-3 gap-1.5 text-[10px]">
                      <div className="bg-[#080a0f] p-2 rounded-xl border border-[#1a2130]">
                        <span className="text-amber-400 font-bold block uppercase text-[8px]">Top Note</span>
                        <span className="text-gray-300 truncate block">{recipe.pyramid.top[0]}</span>
                      </div>
                      <div className="bg-[#080a0f] p-2 rounded-xl border border-[#1a2130]">
                        <span className="text-pink-400 font-bold block uppercase text-[8px]">Heart Note</span>
                        <span className="text-gray-300 truncate block">{recipe.pyramid.heart[0]}</span>
                      </div>
                      <div className="bg-[#080a0f] p-2 rounded-xl border border-[#1a2130]">
                        <span className="text-amber-500 font-bold block uppercase text-[8px]">Base Note</span>
                        <span className="text-gray-300 truncate block">{recipe.pyramid.base[0]}</span>
                      </div>
                    </div>

                    {/* Product Action Button -> Opens Details Page */}
                    <button
                      onClick={() => handleSelectFlacon(recipe.id)}
                      disabled={!isAvailable}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 uppercase tracking-wide disabled:opacity-50"
                    >
                      <span>Select Flacon & Proceed ({profile.currency}{recipe.manualPrice.toLocaleString('en-IN')})</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Discovery Box Option */
            <div className="bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                    Boutique Sampler Set
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1.5 font-serif-luxury">
                    Custom Discovery Box (3 × 5ml)
                  </h3>
                  <p className="text-xs text-gray-400 italic mt-0.5 font-sans">
                    Sample 3 different handcrafted botanical perfumes in fine-mist 5ml flacons before choosing your full bottle.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-extrabold text-amber-400">
                    {profile.currency}{discoveryConfig.price}
                  </span>
                  <span className="text-[9px] text-emerald-400 block font-bold">Free Handcrafted Shipping</span>
                </div>
              </div>

              <div className="bg-[#080a0f] p-3 rounded-2xl border border-[#1e2536] text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 text-gray-200">
                  <span className="text-amber-400">✓</span> 3 × 5ml heavy glass travel sprayers
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <span className="text-amber-400">✓</span> Custom luxury linen slide box with foam insert
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <span className="text-amber-400">✓</span> Pick any 3 fragrances from the collection
                </div>
              </div>

              {/* Action Button -> Opens Details Page */}
              <button
                onClick={handleSelectDiscovery}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 uppercase tracking-wide"
              >
                <span>Customize 3 Samples & Proceed ({profile.currency}{discoveryConfig.price})</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 2: DETAILS & CHECKOUT PAGE (OPENS AFTER PRODUCT SELECTION) */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'details' && (
        <div className="space-y-4 animate-scaleUp">
          {/* Back Button */}
          <button
            onClick={() => setCheckoutStep('catalog')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition py-1"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Scent Collection</span>
          </button>

          {/* Selected Product Summary Card */}
          <div className="bg-gradient-to-r from-[#141926] to-[#0e121a] border border-amber-500/40 rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                  Selected Item
                </span>
                <h3 className="text-base font-extrabold text-white font-serif-luxury mt-0.5">
                  {selectedProductType === 'discovery'
                    ? `Discovery Sampler Box (3 × 5ml)`
                    : selectedRecipe?.name}
                </h3>
                <p className="text-[11px] text-gray-400 italic font-sans">
                  {selectedProductType === 'discovery'
                    ? 'Handmade 3-piece trial set'
                    : `50ml Flacon • ${selectedRecipe?.concentration}`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-extrabold text-emerald-400">
                  {profile.currency}{payablePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-gray-500 block">Total Payable</span>
              </div>
            </div>

            {/* If Discovery Box, show the 3 sample slots selector */}
            {selectedProductType === 'discovery' && (
              <div className="pt-2 border-t border-[#1e2536] space-y-2">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="uppercase font-bold text-amber-400">
                    Choose Your 3 Sample Vials ({selectedDiscoveryIds.length}/3):
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map(slotIdx => {
                    const recipeId = selectedDiscoveryIds[slotIdx];
                    const rec = recipes.find(r => r.id === recipeId);

                    return (
                      <div
                        key={slotIdx}
                        className={`p-2 rounded-xl border text-center text-[10px] ${
                          rec
                            ? 'bg-[#181f2e] border-amber-500/50 text-white font-bold'
                            : 'bg-[#080a0f] border-dashed border-[#222a3d] text-gray-500'
                        }`}
                      >
                        <span className="text-[8px] text-amber-400 block uppercase">Vial 0{slotIdx + 1}</span>
                        <span className="truncate block mt-0.5">{rec ? rec.name.split('&')[0] : 'Choose'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-1">
                  {recipes.map(rec => {
                    const isSelected = selectedDiscoveryIds.includes(rec.id);
                    return (
                      <button
                        type="button"
                        key={rec.id}
                        onClick={() => toggleDiscoveryItem(rec.id)}
                        className={`w-full p-2 rounded-xl border flex items-center justify-between text-left text-xs transition ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-white font-bold'
                            : 'bg-[#080a0f] border-[#1e2536] text-gray-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{rec.name}</span>
                        <span className="text-[10px] text-amber-400">{isSelected ? '✓ In Box' : '+ Add'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleSubmitOrder} className="bg-[#10141e] border border-[#1e2536] rounded-3xl p-5 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                Your Delivery & Contact Details
              </h3>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                The maker will pack and allocate your bespoke serial flacon immediately.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="text-gray-400 text-[11px] block mb-1 font-bold">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singhania"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-400 font-sans text-xs"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-gray-400 text-[11px] block mb-1 font-bold">
                  Phone / WhatsApp Number <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Delivery Method Choice */}
              <div>
                <label className="text-gray-400 text-[11px] block mb-1 font-bold">
                  Handover Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      deliveryMethod === 'delivery'
                        ? 'bg-amber-400 text-black border-amber-400 shadow-sm'
                        : 'bg-[#080a0f] border-[#1e2536] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Doorstep Courier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      deliveryMethod === 'pickup'
                        ? 'bg-amber-400 text-black border-amber-400 shadow-sm'
                        : 'bg-[#080a0f] border-[#1e2536] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Personal Handover</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-gray-400 text-[11px] block mb-1 font-bold">
                  {deliveryMethod === 'delivery' ? 'Full Shipping Address' : 'Pickup / Location Note'} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    required
                    placeholder={deliveryMethod === 'delivery' ? 'Flat/House No, Building, Street, City, Pincode' : 'e.g. Bangalore office handover / Meet in Indiranagar'}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-400 font-sans text-xs"
                  />
                </div>
              </div>

              {/* Optional Gift Note */}
              <div>
                <label className="text-gray-400 text-[11px] block mb-1 font-bold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  Gift Packaging or Custom Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please handwrite a birthday note: 'To Ananya, with love'"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full bg-[#080a0f] border border-[#1e2536] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-sans text-xs"
                />
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-3 rounded-2xl bg-[#080a0f] border border-[#1e2536] space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({selectedProductType === 'discovery' ? 'Discovery Box' : '50ml Flacon'}):</span>
                <span className="font-bold text-white">{profile.currency}{payablePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Handcrafted Linen Presentation:</span>
                <span className="font-bold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Insured Fragrance Shipping:</span>
                <span className="font-bold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-white font-extrabold text-sm pt-1.5 border-t border-[#1a2130]">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-mono">{profile.currency}{payablePrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Prominent Payment / Order Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-1.5 uppercase tracking-wide"
            >
              <span>Confirm Details & Proceed to Payment ({profile.currency}{payablePrice.toLocaleString('en-IN')})</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
            <p className="text-[10px] text-gray-500 text-center font-sans">
              Instant on-screen UPI QR Code appears immediately on the next page.
            </p>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 3: ORDER CONFIRMED & ON-SCREEN UPI/CASH PAYMENT PAGE     */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'confirmation' && submittedOrder && (
        <div className="bg-[#10141e] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
              {submittedOrder.discoveryItems ? 'Discovery Box Reserved!' : 'Flacon Reserved!'}
            </h3>
            <p className="text-xs text-gray-300 font-sans">
              Order Logged: <strong className="text-amber-400 font-mono">{submittedOrder.orderNumber}</strong>
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="bg-[#080a0f] p-3.5 rounded-2xl border border-[#1e2536] space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span className="text-gray-400">Fragrance:</span>
              <strong className="text-amber-300">{submittedOrder.recipeName}</strong>
            </div>

            {submittedOrder.discoveryItems ? (
              <div className="pt-1.5 border-t border-[#1a2130]">
                <span className="text-[10px] text-gray-500 uppercase block mb-1 font-bold">Selected 5ml Samples:</span>
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
                <span className="text-gray-400">Assigned Edition:</span>
                <span className="font-bold text-white">{submittedOrder.bottleSerial}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-300 pt-1.5 border-t border-[#1a2130] font-bold text-sm">
              <span>Total Payable:</span>
              <span className="text-emerald-400 font-mono">{profile.currency}{submittedOrder.price.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* On-Screen Direct UPI QR Code Terminal */}
          <div className="bg-white p-4.5 rounded-2xl text-center space-y-3 text-black shadow-md">
            <div className="space-y-0.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-900">
                Scan with Any UPI App to Complete Payment
              </div>
              <p className="text-[10px] text-gray-600 font-sans">
                Google Pay • PhonePe • Paytm • BHIM • Cred • Mobile Banking
              </p>
            </div>
            
            {/* Crisp High-Res Dynamic Vector QR Code */}
            <div className="w-48 h-48 mx-auto bg-gray-50 border-2 border-black/10 rounded-2xl p-3 flex items-center justify-center shadow-inner">
              <QRCodeSVG
                value={upiUri}
                size={168}
                level="M"
                includeMargin={false}
                className="w-full h-full"
              />
            </div>

            {/* UPI ID & Copy Button */}
            <div className="bg-gray-100 rounded-xl p-2.5 flex items-center justify-between border border-gray-200">
              <div className="text-left">
                <span className="text-[9px] text-gray-500 uppercase block font-bold">Beneficiary UPI ID</span>
                <span className="text-xs font-bold text-gray-800 font-mono">{profile.upiId}</span>
              </div>
              <button
                type="button"
                onClick={copyUpi}
                className="px-2.5 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition hover:bg-gray-800"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedUpi ? 'Copied' : 'Copy UPI'}
              </button>
            </div>

            {/* Deep link direct launch for mobile users */}
            <div className="space-y-1">
              <a
                href={upiUri}
                className="w-full py-3 rounded-xl bg-[#121622] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <span>Tap to Open UPI App (Mobile Only)</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
              <span className="text-[9px] text-gray-500 block font-sans">
                (Tapping above triggers installed UPI apps on smartphones)
              </span>
            </div>

            <div className="pt-1 border-t border-gray-200 flex justify-between items-center text-xs text-gray-700 font-sans">
              <span>Payable Amount:</span>
              <strong className="text-sm font-mono text-emerald-700">₹{submittedOrder.price.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Payment Method Action Buttons: UPI Complete vs Cash Payment */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">
              Choose Payment Confirmation:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Paid via UPI */}
              <button
                type="button"
                onClick={() => handlePaymentConfirm('UPI')}
                className="w-full py-3.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>I Have Paid via UPI</span>
              </button>

              {/* Option 2: Pay with Cash */}
              <button
                type="button"
                onClick={() => handlePaymentConfirm('Cash')}
                className="w-full py-3.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <Banknote className="w-4 h-4 stroke-[2.5]" />
                <span>Pay with Cash (Delivery/Handover)</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutStep('details')}
            className="w-full text-center text-xs text-gray-400 hover:text-white pt-1 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Delivery Details</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 4: ORDER RECEIVED & AUTO-REDIRECT SCREEN                 */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'order_received' && orderCompleteData && (
        <div className="bg-[#10141e] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp text-center">
          {/* Brand Logo & Animated Success Badge */}
          <div className="flex flex-col items-center justify-center gap-2">
            <img src="/ostia-logo.png" alt="OSTIA" className="w-16 h-16 object-contain filter drop-shadow" />
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold block">
              Order Confirmed & Received
            </span>
            <h3 className="text-xl font-extrabold text-white font-serif-luxury">
              Thank You, {orderCompleteData.customerName}!
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Your bespoke fragrance reservation is logged with Master Perfumer <strong className="text-amber-300 font-serif-luxury">{profile.perfumerName}</strong>.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#080a0f] p-4 rounded-2xl border border-[#1e2536] text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#1e2536]">
              <span className="text-gray-400">Order Reference:</span>
              <span className="text-amber-400 font-mono font-extrabold text-sm">{orderCompleteData.orderNumber}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block font-bold">Fragrance / Edition:</span>
              <span className="text-white font-bold block">{orderCompleteData.recipeName}</span>
              <span className="text-[11px] text-gray-400 font-mono block">({orderCompleteData.bottleSerial})</span>
            </div>

            {orderCompleteData.discoveryItems && (
              <div className="pt-2 border-t border-[#1e2536] space-y-1">
                <span className="text-[10px] text-gray-500 uppercase block font-bold">3 Included Vials (5ml):</span>
                <ul className="text-gray-300 text-[11px] space-y-0.5 font-sans">
                  {orderCompleteData.discoveryItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-amber-400">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-2.5 border-t border-[#1e2536]">
              <span className="text-gray-400">Payment Method:</span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                orderCompleteData.paymentMethod === 'UPI'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {orderCompleteData.paymentMethod === 'UPI' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Paid via UPI (Transfer Recorded)</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-3 h-3 text-amber-400" />
                    <span>Pay with Cash on Delivery / Handover</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#1e2536]">
              <span className="text-gray-400">Total Payable:</span>
              <span className="text-emerald-400 font-mono font-extrabold text-sm">
                {profile.currency}{orderCompleteData.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Handover Notice */}
          <div className="p-3 rounded-xl bg-[#141a27] border border-[#222c42] text-[11px] text-gray-300 leading-relaxed font-sans">
            ✨ Handcrafted preparation and packaging has started. You will receive handover and dispatch updates on your phone.
          </div>

          {/* Auto-redirect countdown & manual back button */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold bg-amber-400/10 py-2.5 px-3 rounded-xl border border-amber-400/20">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Redirecting back to storefront in {redirectCountdown}s...</span>
            </div>

            <button
              type="button"
              onClick={resetToCatalog}
              className="w-full py-3 rounded-xl bg-[#181f2e] hover:bg-[#222b3e] text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-[#2a3449] active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Return to Scent Collection Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
