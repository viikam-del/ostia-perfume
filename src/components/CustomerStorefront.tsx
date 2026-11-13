import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '../types';
import { getDefaultRecipeSizes } from '../data/initialData';
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
  RotateCcw,
  Layers,
  ShieldCheck,
  Award
} from 'lucide-react';

export const CustomerStorefront: React.FC = () => {
  const { profile, recipes, addOrder, updateOrderStatus, discoveryConfig } = useApp();

  // Multi-step checkout funnel state
  const [checkoutStep, setCheckoutStep] = useState<'catalog' | 'details' | 'confirmation' | 'order_received'>('catalog');
  
  // Selection
  const [selectedProductType, setSelectedProductType] = useState<'flacon' | 'discovery'>('flacon');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [selectedSizeMl, setSelectedSizeMl] = useState<number>(50);
  const [recipeSelectedSizes, setRecipeSelectedSizes] = useState<Record<string, number>>({});
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

  // Choose product from catalog and move to details page
  const handleSelectFlacon = (recipeId: string, sizeMl?: number) => {
    const chosenSize = sizeMl || recipeSelectedSizes[recipeId] || 50;
    setSelectedRecipeId(recipeId);
    setSelectedSizeMl(chosenSize);
    setRecipeSelectedSizes(prev => ({ ...prev, [recipeId]: chosenSize }));
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

  // Submit form on details page and move to confirmation/payment page
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
        bottleSizeMl: 15,
        bottleSizeLabel: `Discovery Sampler Box (3 × 5ml)`,
        discoveryItems: selectedNames,
        bottleSerial: `Discovery Box #${Math.floor(100 + Math.random() * 900)}`,
        price: discoveryConfig.price,
        paymentMethod: 'Pending',
        status: 'Pending Payment'
      });

      setSubmittedOrder(createdOrder);
    } else {
      if (!selectedRecipe) return;

      const activeSize = (selectedRecipe.sizes && selectedRecipe.sizes.length > 0
        ? selectedRecipe.sizes
        : getDefaultRecipeSizes(selectedRecipe.manualPrice))
        .find(s => s.sizeMl === selectedSizeMl) || { sizeMl: 50, label: '50ml Signature Flacon', price: selectedRecipe.manualPrice, inStock: selectedRecipe.inStockBottles };

      const totalYield = selectedRecipe.bottlesYield || 10;
      const remaining = activeSize.inStock;
      const serialNum = Math.max(1, totalYield - remaining + 1);
      const bottleSerial = `${activeSize.sizeMl}ml • Bottle ${String(serialNum).padStart(2, '0')} of ${totalYield}`;

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
        recipeName: `${selectedRecipe.name} (${activeSize.label})`,
        bottleSizeMl: activeSize.sizeMl,
        bottleSizeLabel: activeSize.label,
        bottleSerial,
        price: activeSize.price,
        paymentMethod: 'Pending',
        status: 'Pending Payment'
      });

      setSubmittedOrder(createdOrder);
    }

    setCheckoutStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User chooses payment method: Paid via UPI vs Pay with Cash
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

  const activeSelectedSizeObj = selectedRecipe
    ? ((selectedRecipe.sizes && selectedRecipe.sizes.length > 0
        ? selectedRecipe.sizes
        : getDefaultRecipeSizes(selectedRecipe.manualPrice))
        .find(s => s.sizeMl === selectedSizeMl) || { sizeMl: 50, label: '50ml Signature Flacon', price: selectedRecipe.manualPrice, inStock: selectedRecipe.inStockBottles })
    : { sizeMl: 50, label: '50ml Signature Flacon', price: 2899, inStock: 5 };

  const payablePrice = selectedProductType === 'discovery' ? discoveryConfig.price : activeSelectedSizeObj.price;

  // Standard NPCI UPI URI string
  const upiUri = submittedOrder
    ? `upi://pay?pa=${encodeURIComponent(profile.upiId)}&pn=${encodeURIComponent(profile.businessName || 'Ostia')}&am=${submittedOrder.price}&cu=INR&tn=${encodeURIComponent(submittedOrder.orderNumber)}`
    : '';

  return (
    <div className="w-full space-y-4 pb-20 pt-1 select-none">
      {/* ------------------------------------------------------------- */}
      {/* BRAND HERO SECTION (Reference 2 Atmospheric Glow)             */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep !== 'confirmation' && checkoutStep !== 'order_received' && (
        <div className="relative text-center space-y-2.5 py-4 px-2">
          {/* Subtle Ambient Glow behind logo */}
          <div className="w-24 h-24 mx-auto relative group">
            <div className="absolute inset-0 bg-amber-500/25 rounded-3xl blur-xl" />
            <div className="relative w-full h-full rounded-3xl bg-[#14100c]/90 border border-amber-500/35 p-2 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <img
                src="/ostia-logo.png"
                alt="OSTIA Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Haute Parfumerie • Micro-Batch</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-[0.25em] font-serif-luxury uppercase">
              {profile.businessName}
            </h2>

            <p className="text-[11px] text-amber-200/90 font-medium tracking-wide font-sans mt-0.5">
              By Master Perfumer <span className="text-amber-400 font-serif-luxury font-bold">{profile.perfumerName}</span>
            </p>

            <p className="text-xs text-stone-400 max-w-xs mx-auto italic font-sans mt-1">
              "{profile.tagline}"
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 1: SCENT CATALOG & PRODUCT SELECTION                     */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'catalog' && (
        <div className="space-y-4">
          {/* Category Pill Switcher (Ref 1 & 2 Style) */}
          <div className="flex gap-1.5 bg-[#14100c] p-1.5 rounded-full border border-amber-500/20 text-xs">
            <button
              onClick={() => setCatalogCategory('flacons')}
              className={`flex-1 py-2 px-3 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                catalogCategory === 'flacons'
                  ? 'btn-glow-amber text-white font-extrabold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Flacons</span>
            </button>
            <button
              onClick={() => setCatalogCategory('discovery')}
              className={`flex-1 py-2 px-3 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                catalogCategory === 'discovery'
                  ? 'btn-glow-amber text-white font-extrabold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Discovery Set (₹{discoveryConfig.price})</span>
            </button>
          </div>

          {/* Bespoke Flacons Single-Column Feed */}
          {catalogCategory === 'flacons' ? (
            <div className="space-y-4">
              {recipes.map(recipe => {
                const availableSizes = recipe.sizes && recipe.sizes.length > 0
                  ? recipe.sizes
                  : getDefaultRecipeSizes(recipe.manualPrice);

                const currentSizeMl = recipeSelectedSizes[recipe.id] || 50;
                const activeSize = availableSizes.find(s => s.sizeMl === currentSizeMl) || availableSizes.find(s => s.sizeMl === 50) || availableSizes[0];
                const isAvailable = activeSize.inStock > 0;

                return (
                  <div
                    key={recipe.id}
                    className="card-luxury card-luxury-hover rounded-3xl p-4.5 space-y-3.5 relative overflow-hidden"
                  >
                    {/* Top Header: Concentration, Name, Price & Stock */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase">
                          {recipe.concentration}
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-1 font-serif-luxury tracking-wide truncate">
                          {recipe.name}
                        </h3>
                        <p className="text-xs text-stone-400 italic mt-0.5 font-sans truncate">
                          "{recipe.tagline}"
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
                          ₹{activeSize.price.toLocaleString('en-IN')}
                        </div>
                        <span className={`text-[10px] font-mono font-bold inline-block mt-0.5 px-2 py-0.2 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}>
                          {isAvailable ? `${activeSize.inStock} Available` : 'Sold Out'}
                        </span>
                      </div>
                    </div>

                    {/* Scent Pyramid Notes */}
                    <div className="pt-2.5 border-t border-[#221a14] space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 font-mono font-bold text-[9px] uppercase tracking-wider w-12 shrink-0 pt-0.5">Top:</span>
                        <span className="text-stone-300 font-sans text-xs leading-tight">{recipe.pyramid.top.join(' • ')}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400 font-mono font-bold text-[9px] uppercase tracking-wider w-12 shrink-0 pt-0.5">Heart:</span>
                        <span className="text-stone-300 font-sans text-xs leading-tight">{recipe.pyramid.heart.join(' • ')}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-400 font-mono font-bold text-[9px] uppercase tracking-wider w-12 shrink-0 pt-0.5">Base:</span>
                        <span className="text-stone-300 font-sans text-xs leading-tight">{recipe.pyramid.base.join(' • ')}</span>
                      </div>
                    </div>

                    {/* Flacon Sizing Selector (4-Option Pills) */}
                    <div className="pt-2.5 border-t border-[#221a14] space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-stone-400 uppercase font-bold tracking-wider flex items-center gap-1 font-mono">
                          <Layers className="w-3 h-3 text-amber-400" />
                          Select Size:
                        </span>
                        <span className="text-amber-300 font-mono font-bold">{activeSize.label}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {availableSizes.map(size => {
                          const isSelected = size.sizeMl === activeSize.sizeMl;
                          const hasStock = size.inStock > 0;
                          return (
                            <button
                              key={size.sizeMl}
                              type="button"
                              onClick={() => {
                                setRecipeSelectedSizes(prev => ({ ...prev, [recipe.id]: size.sizeMl }));
                              }}
                              className={`py-2 px-1 rounded-2xl text-center border transition-all relative ${
                                isSelected
                                  ? 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
                                  : hasStock
                                  ? 'bg-[#15110d] hover:bg-[#1e1813] text-stone-300 border-amber-500/15'
                                  : 'bg-[#100d0a] text-stone-600 border-[#1c1611] opacity-40'
                              }`}
                            >
                              <div className="text-xs font-mono font-extrabold">{size.sizeMl}ml</div>
                              <div className={`text-[9px] mt-0.5 font-mono ${isSelected ? 'text-amber-300 font-black' : 'text-stone-400'}`}>
                                ₹{size.price.toLocaleString('en-IN')}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA Button -> Opens Details Funnel */}
                    <button
                      onClick={() => handleSelectFlacon(recipe.id, activeSize.sizeMl)}
                      disabled={!isAvailable}
                      className="w-full btn-glow-amber py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-40"
                    >
                      <span>
                        {isAvailable
                          ? `Acquire ${activeSize.sizeMl}ml Flacon (₹${activeSize.price.toLocaleString('en-IN')})`
                          : `${activeSize.sizeMl}ml Sold Out`}
                      </span>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Discovery Box Option */
            <div className="card-luxury rounded-3xl p-5 space-y-4 relative overflow-hidden border-amber-500/30">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase">
                    Boutique Sampler Coffret
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1.5 font-serif-luxury">
                    Custom Discovery Box (3 × 5ml)
                  </h3>
                  <p className="text-xs text-stone-400 italic mt-0.5 font-sans">
                    Sample 3 handcrafted micro-batch perfumes in fine-mist flacons before commissioning your full bespoke bottle.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    ₹{discoveryConfig.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-emerald-400 block font-bold font-mono">Free Insured Courier</span>
                </div>
              </div>

              <div className="bg-[#14100c] p-3.5 rounded-2xl border border-amber-500/15 text-xs space-y-2">
                <div className="flex items-center gap-2 text-stone-300 font-sans">
                  <span className="text-amber-400 font-bold">✓</span> 3 × 5ml heavy Italian glass spray vials
                </div>
                <div className="flex items-center gap-2 text-stone-300 font-sans">
                  <span className="text-amber-400 font-bold">✓</span> Custom luxury linen slide box with foam insert
                </div>
                <div className="flex items-center gap-2 text-stone-300 font-sans">
                  <span className="text-amber-400 font-bold">✓</span> Select any 3 formulations from Faisal Parvez
                </div>
              </div>

              {/* Action Button -> Opens Details Page */}
              <button
                onClick={handleSelectDiscovery}
                className="w-full btn-glow-amber py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Customize 3 Samples & Proceed (₹{discoveryConfig.price.toLocaleString('en-IN')})</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 2: DETAILS & CHECKOUT PAGE (CLIENT RESERVATION)          */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'details' && (
        <div className="space-y-4">
          {/* Back Button */}
          <button
            onClick={() => setCheckoutStep('catalog')}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition py-1 font-mono"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Scent Collection</span>
          </button>

          {/* Selected Product Summary Card */}
          <div className="card-luxury rounded-3xl p-4 space-y-3 border-amber-500/30">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[9px] text-amber-400 uppercase font-mono font-bold tracking-wider">
                  Selected Item
                </span>
                <h3 className="text-base font-extrabold text-white font-serif-luxury mt-0.5">
                  {selectedProductType === 'discovery'
                    ? `Discovery Sampler Box (3 × 5ml)`
                    : selectedRecipe?.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {selectedProductType === 'discovery' ? (
                    <span className="text-[11px] text-stone-400 italic font-sans">
                      Handcrafted 3-piece trial coffret
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeSelectedSizeObj.label}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {selectedRecipe?.concentration}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  ₹{payablePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-stone-500 block font-mono">Total Payable</span>
              </div>
            </div>

            {/* Quick Sizing Switcher on Details Page */}
            {selectedProductType === 'flacon' && selectedRecipe && (
              <div className="pt-2.5 border-t border-[#221a14] space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-stone-400 uppercase font-bold tracking-wider font-mono">Switch Flacon Size:</span>
                  <span className="text-amber-300 font-mono font-bold">{selectedSizeMl}ml</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(selectedRecipe.sizes || getDefaultRecipeSizes(selectedRecipe.manualPrice)).map(size => {
                    const isSelected = size.sizeMl === selectedSizeMl;
                    return (
                      <button
                        key={size.sizeMl}
                        type="button"
                        onClick={() => setSelectedSizeMl(size.sizeMl)}
                        className={`py-2 px-1 rounded-2xl text-center border transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : 'bg-[#14100d] text-stone-400 border-amber-500/15 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-mono font-extrabold">{size.sizeMl}ml</div>
                        <div className={`text-[9px] mt-0.5 font-mono ${isSelected ? 'text-amber-300 font-black' : 'text-stone-400'}`}>
                          ₹{size.price.toLocaleString('en-IN')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If Discovery Box, show the 3 sample slots selector */}
            {selectedProductType === 'discovery' && (
              <div className="pt-2.5 border-t border-[#221a14] space-y-2">
                <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono">
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
                        className={`p-2 rounded-2xl border text-center text-[10px] ${
                          rec
                            ? 'bg-[#18130f] border-amber-500/40 text-white font-bold'
                            : 'bg-[#120e0a] border-dashed border-[#241c14] text-stone-500'
                        }`}
                      >
                        <span className="text-[8px] text-amber-400 block uppercase font-mono">Vial 0{slotIdx + 1}</span>
                        <span className="truncate block mt-0.5 font-serif-luxury">{rec ? rec.name.split('&')[0] : 'Empty Slot'}</span>
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
                        className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-left text-xs transition ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-white font-bold'
                            : 'bg-[#14100d] border-amber-500/15 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate font-serif-luxury">{rec.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">{isSelected ? '✓ In Coffret' : '+ Select'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleSubmitOrder} className="card-luxury rounded-3xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <User className="w-4 h-4 text-amber-400" />
                Delivery & Contact Details
              </h3>
              <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                The atelier will pack and allocate your bespoke serial flacon immediately.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="text-stone-300 text-[11px] block mb-1 font-bold">
                  Collector / Client Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singhania"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl pl-10 pr-3.5 py-2.5 text-white outline-none focus:border-amber-400 font-sans text-xs transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-stone-300 text-[11px] block mb-1 font-bold">
                  WhatsApp / Phone Number <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl pl-10 pr-3.5 py-2.5 text-white outline-none focus:border-amber-400 text-xs font-mono transition"
                  />
                </div>
              </div>

              {/* Handover Method Choice */}
              <div>
                <label className="text-stone-300 text-[11px] block mb-1 font-bold">
                  Handover Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      deliveryMethod === 'delivery'
                        ? 'btn-glow-amber text-white'
                        : 'bg-[#14100d] border-amber-500/15 text-stone-400 hover:text-white'
                    }`}
                  >
                    <span>Doorstep Courier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      deliveryMethod === 'pickup'
                        ? 'btn-glow-amber text-white'
                        : 'bg-[#14100d] border-amber-500/15 text-stone-400 hover:text-white'
                    }`}
                  >
                    <span>Studio Handover</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-stone-300 text-[11px] block mb-1 font-bold">
                  {deliveryMethod === 'delivery' ? 'Shipping Address' : 'Studio Pickup / Location Note'} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    required
                    placeholder={deliveryMethod === 'delivery' ? 'Flat/House No, Building, Street, City, Pincode' : 'e.g. Indiranagar Bangalore Studio handover / In-person meetup'}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl pl-10 pr-3.5 py-2.5 text-white outline-none focus:border-amber-400 font-sans text-xs transition"
                  />
                </div>
              </div>

              {/* Optional Gift Note */}
              <div>
                <label className="text-stone-300 text-[11px] block mb-1 font-bold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  Gift Presentation / Handwritten Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please handwrite note: 'To Ananya, Happy Anniversary'"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 font-sans text-xs transition"
                />
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-3.5 rounded-2xl bg-[#14100d] border border-amber-500/15 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal ({selectedProductType === 'discovery' ? 'Discovery Box' : activeSelectedSizeObj.label}):</span>
                <span className="font-bold text-white">₹{payablePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Linen Presentation Coffret:</span>
                <span className="font-bold text-emerald-400 font-sans">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Insured White-Glove Dispatch:</span>
                <span className="font-bold text-emerald-400 font-sans">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-[#221a14]">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-mono">₹{payablePrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Prominent Proceed Button */}
            <button
              type="submit"
              className="w-full btn-glow-amber py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Confirm & Proceed to Payment (₹{payablePrice.toLocaleString('en-IN')})</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <p className="text-[10px] text-stone-500 text-center font-sans">
              Direct UPI QR Code and Cash options appear on the confirmation screen.
            </p>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 3: ORDER CONFIRMED & ON-SCREEN UPI/CASH PAYMENT PAGE     */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep === 'confirmation' && submittedOrder && (
        <div className="card-luxury rounded-3xl p-5 space-y-4 border-emerald-500/40">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-1 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
              {submittedOrder.discoveryItems ? 'Discovery Box Reserved!' : 'Flacon Reserved!'}
            </h3>
            <p className="text-xs text-stone-300 font-sans">
              Order Reference: <strong className="text-amber-300 font-mono">{submittedOrder.orderNumber}</strong>
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="bg-[#14100d] p-3.5 rounded-2xl border border-amber-500/15 space-y-2 text-xs">
            <div className="flex justify-between text-stone-300">
              <span className="text-stone-400">Fragrance:</span>
              <strong className="text-amber-300 font-serif-luxury">{submittedOrder.recipeName}</strong>
            </div>

            {submittedOrder.discoveryItems ? (
              <div className="pt-1.5 border-t border-[#221a14]">
                <span className="text-[10px] text-stone-500 uppercase block mb-1 font-bold font-mono">Selected 5ml Samples:</span>
                <ul className="space-y-0.5 text-white font-semibold">
                  {submittedOrder.discoveryItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px] font-sans">
                      <span className="text-amber-400">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">Allocated Edition:</span>
                <span className="font-bold text-white font-mono">{submittedOrder.bottleSerial}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-300 pt-1.5 border-t border-[#221a14] font-bold text-sm">
              <span>Payable Amount:</span>
              <span className="text-emerald-400 font-mono">₹{submittedOrder.price.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* On-Screen Direct UPI QR Code Terminal */}
          <div className="bg-white p-4.5 rounded-3xl text-center space-y-3 text-black shadow-2xl">
            <div className="space-y-0.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-900 font-mono">
                Scan with Any UPI App to Complete
              </div>
              <p className="text-[10px] text-gray-600 font-sans">
                Google Pay • PhonePe • Paytm • BHIM • Cred • Banking Apps
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
                <span className="text-[9px] text-gray-500 uppercase block font-bold font-mono">Atelier UPI ID</span>
                <span className="text-xs font-bold text-gray-800 font-mono">{profile.upiId}</span>
              </div>
              <button
                type="button"
                onClick={copyUpi}
                className="px-2.5 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition hover:bg-gray-800 font-mono"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedUpi ? 'Copied' : 'Copy UPI'}
              </button>
            </div>

            {/* Deep link direct launch for mobile users */}
            <div className="space-y-1">
              <a
                href={upiUri}
                className="w-full py-3 rounded-xl bg-gray-950 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <span>Tap to Open UPI App (Mobile Only)</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
              <span className="text-[9px] text-gray-500 block font-sans">
                (Tapping opens installed UPI apps directly on mobile devices)
              </span>
            </div>

            <div className="pt-1 border-t border-gray-200 flex justify-between items-center text-xs text-gray-700 font-sans">
              <span>Payable Amount:</span>
              <strong className="text-sm font-mono text-emerald-700">₹{submittedOrder.price.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Payment Method Action Buttons: UPI Complete vs Cash Payment */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] text-stone-400 text-center font-bold uppercase tracking-wider font-mono">
              Confirm Payment Method:
            </div>

            <div className="space-y-2">
              {/* Option 1: Paid via UPI */}
              <button
                type="button"
                onClick={() => handlePaymentConfirm('UPI')}
                className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide font-mono"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>I Have Paid via UPI</span>
              </button>

              {/* Option 2: Pay with Cash */}
              <button
                type="button"
                onClick={() => handlePaymentConfirm('Cash')}
                className="w-full py-3.5 px-3 rounded-2xl bg-[#18130f] hover:bg-[#201914] text-amber-300 font-bold text-xs border border-amber-500/30 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide font-mono"
              >
                <Banknote className="w-4 h-4 stroke-[2]" />
                <span>Pay Cash on Delivery / Studio Pickup</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutStep('details')}
            className="w-full text-center text-xs text-stone-400 hover:text-white pt-1 flex items-center justify-center gap-1 font-mono"
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
        <div className="card-luxury rounded-3xl p-6 space-y-5 text-center border-emerald-500/50">
          {/* Brand Logo & Success Badge */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-[#18130f] border border-amber-500/30 p-2 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <img src="/ostia-logo.png" alt="OSTIA" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold block font-mono">
              Order Confirmed & Received
            </span>
            <h3 className="text-xl font-extrabold text-white font-serif-luxury">
              Thank You, {orderCompleteData.customerName}!
            </h3>
            <p className="text-xs text-stone-300 font-sans">
              Your bespoke fragrance allocation is logged with Master Perfumer <strong className="text-amber-300 font-serif-luxury">{profile.perfumerName}</strong>.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#14100d] p-4 rounded-2xl border border-amber-500/15 text-left text-xs space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#221a14]">
              <span className="text-stone-400">Order Reference:</span>
              <span className="text-amber-300 font-bold text-sm">{orderCompleteData.orderNumber}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-stone-500 uppercase block font-bold">Fragrance / Edition:</span>
              <span className="text-white font-bold block font-serif-luxury">{orderCompleteData.recipeName}</span>
              <span className="text-[11px] text-stone-400 block font-mono">({orderCompleteData.bottleSerial})</span>
            </div>

            {orderCompleteData.discoveryItems && (
              <div className="pt-2 border-t border-[#221a14] space-y-1">
                <span className="text-[10px] text-stone-500 uppercase block font-bold">Included 5ml Vials:</span>
                <ul className="text-stone-300 text-[11px] space-y-0.5 font-sans">
                  {orderCompleteData.discoveryItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-amber-400">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-2.5 border-t border-[#221a14]">
              <span className="text-stone-400">Payment:</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                orderCompleteData.paymentMethod === 'UPI'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {orderCompleteData.paymentMethod === 'UPI' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Paid via UPI (Transfer Logged)</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-3 h-3 text-amber-400" />
                    <span>Pay Cash on Delivery / Handover</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#221a14]">
              <span className="text-stone-400">Total Payable:</span>
              <span className="text-emerald-400 font-mono font-extrabold text-sm">
                ₹{orderCompleteData.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Handover Notice */}
          <div className="p-3 rounded-2xl bg-[#14100d] border border-amber-500/20 text-[11px] text-stone-300 leading-relaxed font-sans">
            ✨ Handcrafted preparation has begun in the atelier. You will receive dispatch updates on WhatsApp/Phone.
          </div>

          {/* Auto-redirect countdown & manual back button */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-bold bg-amber-500/10 py-2.5 px-3 rounded-2xl border border-amber-500/25 font-mono">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span>Returning to collection in {redirectCountdown}s...</span>
            </div>

            <button
              type="button"
              onClick={resetToCatalog}
              className="w-full py-3 rounded-2xl bg-[#18130f] hover:bg-[#201914] text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-amber-500/20 active:scale-95 font-mono"
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
