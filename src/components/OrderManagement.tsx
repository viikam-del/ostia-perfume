import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  ReceiptText,
  CheckCircle,
  Clock,
  Banknote,
  Phone,
  MapPin,
  Tag,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Package
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, profile } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const copyVpa = () => {
    navigator.clipboard.writeText(profile.upiId);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const q = searchQuery.toLowerCase().trim();

  const filteredOrders = orders.filter(o => {
    // Status filter
    if (filter === 'pending' && o.status !== 'Pending Payment') return false;
    if (filter === 'paid' && o.status !== 'Paid') return false;
    if (filter === 'delivered' && o.status !== 'Delivered') return false;

    // Search query
    if (q) {
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      const matchRecipe = o.recipeName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.toLowerCase().includes(q);
      return matchName || matchOrderNum || matchRecipe || matchPhone;
    }

    return true;
  });

  const totalCollectedINR = orders
    .filter(o => o.status === 'Paid' || o.status === 'Delivered')
    .reduce((sum, o) => sum + o.price, 0);

  const pendingDuesINR = orders
    .filter(o => o.status === 'Pending Payment')
    .reduce((sum, o) => sum + o.price, 0);

  const pendingCount = orders.filter(o => o.status === 'Pending Payment').length;
  const paidCount = orders.filter(o => o.status === 'Paid').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Telemetry Bar (3 Compact Mobile SaaS Metric Cards) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="card-luxury rounded-3xl p-3">
          <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block font-mono">Orders</span>
          <div className="text-lg font-extrabold text-white mt-0.5 font-mono">{orders.length}</div>
          <span className="text-[8px] text-stone-500 block truncate font-sans">{deliveredCount} Fulfilled</span>
        </div>

        <div className="card-luxury rounded-3xl p-3 border-amber-500/30">
          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400 block font-mono">Pending</span>
          <div className="text-lg font-extrabold text-amber-300 mt-0.5 font-mono">
            ₹{pendingDuesINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[8px] text-amber-500/80 block truncate font-sans">{pendingCount} Awaiting</span>
        </div>

        <div className="card-luxury rounded-3xl p-3 border-emerald-500/30">
          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 block font-mono">Realized</span>
          <div className="text-lg font-extrabold text-emerald-400 mt-0.5 font-mono">
            ₹{totalCollectedINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[8px] text-emerald-500/80 block truncate font-sans">Settled</span>
        </div>
      </div>

      {/* Official UPI Terminal Banner */}
      <div className="card-luxury rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-3.5 shadow-md border-amber-500/30">
        <div className="w-16 h-16 bg-white p-1 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <QRCodeSVG
            value={`upi://pay?pa=${encodeURIComponent(profile.upiId)}&pn=${encodeURIComponent(profile.businessName)}&cu=INR`}
            size={56}
            level="M"
          />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-white font-mono">Direct Atelier UPI Terminal</span>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.2 rounded-full font-bold border border-emerald-500/30 font-mono">
              Active VPA
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <span className="text-xs font-bold text-amber-300 font-mono">{profile.upiId}</span>
            <button
              onClick={copyVpa}
              className="px-2 py-0.5 rounded-full bg-[#1b1510] hover:bg-[#251e18] text-stone-300 text-[10px] flex items-center gap-1 active:scale-95 transition font-mono border border-amber-500/20"
            >
              {copiedVpa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
              {copiedVpa ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-sans">
            Client QR scan writes payments directly to this UPI address with zero intermediary commissions.
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold font-mono animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Search & Filter Tabs */}
      <div className="space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer, phone, order #, or fragrance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14100d] border border-amber-500/20 rounded-2xl pl-10 pr-3.5 py-2.5 text-white outline-none focus:border-amber-400 text-xs font-sans placeholder:text-stone-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-[#14100d] p-1.5 rounded-full border border-amber-500/20 text-xs overflow-x-auto no-scrollbar font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-3 rounded-full font-bold transition-all text-xs ${
              filter === 'all' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`py-1.5 px-3 rounded-full font-bold transition-all text-xs ${
              filter === 'pending' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`py-1.5 px-3 rounded-full font-bold transition-all text-xs ${
              filter === 'paid' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`py-1.5 px-3 rounded-full font-bold transition-all text-xs ${
              filter === 'delivered' ? 'btn-glow-amber text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-stone-500 card-luxury rounded-3xl border-dashed text-xs">
            No orders match the current query or filter.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPending = order.status === 'Pending Payment';
            const isDelivered = order.status === 'Delivered';

            return (
              <div
                key={order.id}
                className={`card-luxury rounded-3xl p-4 transition-all space-y-3 ${
                  isPending ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : ''
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white font-sans truncate">{order.customerName}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono shrink-0 ${
                            isPending
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isDelivered
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {isPending ? 'Pending Payment' : isDelivered ? '✓ Delivered' : `✓ ${order.paymentMethod} Verified`}
                        </span>
                      </div>
                      <div className="text-xs text-amber-300 font-bold mt-1 font-serif-luxury truncate">
                        {order.recipeName}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-white font-mono">
                        ₹{order.price.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Details Badge */}
                  <div className="bg-[#14100d] p-3 rounded-2xl border border-amber-500/15 space-y-1.5 text-[11px] text-stone-300">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.bottleSizeLabel && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {order.bottleSizeLabel}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                          <Tag className="w-3 h-3" />
                          {order.bottleSerial}
                        </span>
                      </div>
                      <span className="text-stone-400 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-stone-500" />
                        {order.customerPhone || 'Direct Client'}
                      </span>
                    </div>

                    {order.discoveryItems && order.discoveryItems.length > 0 && (
                      <div className="bg-[#1b1510] p-2 rounded-xl border border-amber-500/20 text-[10px]">
                        <span className="text-stone-400 uppercase font-bold block mb-0.5 font-mono">Curated 5ml Vials:</span>
                        <div className="text-white font-medium font-sans">
                          {order.discoveryItems.join(' • ')}
                        </div>
                      </div>
                    )}

                    {order.deliveryNote && (
                      <div className="flex items-center gap-1 text-stone-400 pt-1 border-t border-[#221a14] font-sans text-[10px]">
                        <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                        <span className="truncate">{order.deliveryNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 border-t border-[#221a14] flex items-center justify-between gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Paid', 'UPI');
                          showToast(`Confirmed UPI receipt for ${order.customerName}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition font-mono"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        ✓ Confirm UPI
                      </button>

                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Paid', 'Cash');
                          showToast(`Recorded Cash Payment for ${order.customerName}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-2xl bg-[#18130f] hover:bg-[#201914] text-stone-200 text-xs font-bold flex items-center justify-center gap-1 border border-amber-500/25 active:scale-95 transition font-mono"
                      >
                        <Banknote className="w-3.5 h-3.5 text-amber-400" />
                        Cash Paid
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex justify-between items-center text-xs">
                      <button
                        onClick={() => {
                          const nextStatus = isDelivered ? 'Paid' : 'Delivered';
                          updateOrderStatus(order.id, nextStatus);
                          showToast(isDelivered ? `Marked order as Paid` : `Marked order as Delivered to ${order.customerName}`);
                        }}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border transition font-mono ${
                          isDelivered
                            ? 'bg-[#18130f] text-stone-300 border-amber-500/20'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                        }`}
                      >
                        {isDelivered ? '✓ Mark as Awaiting Delivery' : '📦 Mark Delivered'}
                      </button>

                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Pending Payment', 'Pending');
                          showToast(`Reverted ${order.orderNumber} to Pending`);
                        }}
                        className="text-[10px] text-stone-500 hover:text-white underline font-mono"
                      >
                        Reset to Pending
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
