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
  ShieldCheck
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
    <div className="space-y-4 pb-20 font-mono">
      {/* Telemetry Bar (3 Compact Mobile SaaS Metric Cards) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-2.5">
          <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block">Orders</span>
          <div className="text-base font-extrabold text-white mt-0.5">{orders.length}</div>
          <span className="text-[8px] text-gray-500 block truncate">{deliveredCount} Fulfilled</span>
        </div>

        <div className="bg-[#10141e] border border-amber-500/30 rounded-2xl p-2.5">
          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400 block">Pending</span>
          <div className="text-base font-extrabold text-amber-400 mt-0.5">
            {profile.currency}{pendingDuesINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[8px] text-amber-500/70 block truncate">{pendingCount} Awaiting</span>
        </div>

        <div className="bg-[#10141e] border border-emerald-500/30 rounded-2xl p-2.5">
          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 block">Realized</span>
          <div className="text-base font-extrabold text-emerald-400 mt-0.5">
            {profile.currency}{totalCollectedINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[8px] text-emerald-500/70 block truncate">Settled</span>
        </div>
      </div>

      {/* Official UPI Terminal Banner */}
      <div className="bg-gradient-to-r from-[#121622] via-[#0e121a] to-[#0a0d14] border border-[#222a3d] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-4 shadow-md">
        <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <QRCodeSVG
            value={`upi://pay?pa=${encodeURIComponent(profile.upiId)}&pn=${encodeURIComponent(profile.businessName)}&cu=INR`}
            size={56}
            level="M"
          />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-white">Direct Beneficiary Terminal</span>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
              Active NPCI VPA
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <span className="text-xs font-bold text-amber-300 font-mono">{profile.upiId}</span>
            <button
              onClick={copyVpa}
              className="px-2 py-0.5 rounded bg-[#1c2230] hover:bg-[#252d40] text-gray-300 text-[10px] flex items-center gap-1 active:scale-95 transition"
            >
              {copiedVpa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedVpa ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 font-sans">
            Client QR scan writes payments directly to this merchant UPI address with zero intermediary commissions.
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-fadeIn">
          {toast}
        </div>
      )}

      {/* SaaS Controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, order #, or fragrance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#10141e] border border-[#1e2536] rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-400 text-xs font-sans placeholder:text-gray-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-[#10141e] p-1 rounded-xl border border-[#1e2536] text-xs shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-3 rounded-lg font-bold transition ${
              filter === 'all' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`py-1.5 px-3 rounded-lg font-bold transition ${
              filter === 'pending' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`py-1.5 px-3 rounded-lg font-bold transition ${
              filter === 'paid' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`py-1.5 px-3 rounded-lg font-bold transition ${
              filter === 'delivered' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      {/* Orders List (Responsive 2-column SaaS Grid on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-[#10141e] rounded-2xl border border-[#1e2536] text-xs">
            No orders match the current query or filter.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPending = order.status === 'Pending Payment';
            const isDelivered = order.status === 'Delivered';

            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPending
                    ? 'bg-[#121622] border-amber-500/40 shadow-sm'
                    : 'bg-[#10141e] border-[#1e2536]'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white font-sans">{order.customerName}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
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
                      <div className="text-xs text-amber-300 font-bold mt-1 font-serif-luxury">
                        {order.recipeName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white font-mono">
                        {profile.currency}{order.price.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Details Badge */}
                  <div className="bg-[#080a0f] p-2.5 rounded-xl border border-[#1a2130] space-y-1.5 text-[11px] text-gray-300">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.bottleSizeLabel && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {order.bottleSizeLabel}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Tag className="w-3 h-3" />
                          {order.bottleSerial}
                        </span>
                      </div>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        {order.customerPhone || 'Direct Client'}
                      </span>
                    </div>

                    {order.discoveryItems && order.discoveryItems.length > 0 && (
                      <div className="bg-[#121622] p-2 rounded-lg border border-[#1e2536] text-[10px]">
                        <span className="text-gray-400 uppercase font-bold block mb-0.5">Curated 5ml Vials:</span>
                        <div className="text-white font-medium">
                          {order.discoveryItems.join(' • ')}
                        </div>
                      </div>
                    )}

                    {order.deliveryNote && (
                      <div className="flex items-center gap-1 text-gray-400 pt-0.5 border-t border-[#1a2130] font-sans text-[10px]">
                        <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                        <span className="truncate">{order.deliveryNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-3 mt-3 border-t border-[#1c2230] flex items-center justify-between gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Paid', 'UPI');
                          showToast(`Confirmed UPI receipt for ${order.customerName}`);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        ✓ Confirm UPI
                      </button>

                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Paid', 'Cash');
                          showToast(`Recorded Cash Payment for ${order.customerName}`);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-[#181f2d] hover:bg-[#20293d] text-gray-200 text-xs font-bold flex items-center justify-center gap-1 border border-[#263147] active:scale-95 transition"
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
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                          isDelivered
                            ? 'bg-[#182030] text-gray-300 border-[#25324d]'
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
                        className="text-[10px] text-gray-500 hover:text-white underline"
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
