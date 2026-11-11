import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReceiptText, QrCode, CheckCircle, Clock, Banknote, Phone, MapPin, Tag, Copy, Check } from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, profile } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
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

  const filteredOrders = orders.filter(o => {
    if (filter === 'pending') return o.status === 'Pending Payment';
    if (filter === 'paid') return o.status === 'Paid' || o.status === 'Delivered';
    return true;
  });

  const totalCollectedINR = orders
    .filter(o => o.status === 'Paid' || o.status === 'Delivered')
    .reduce((sum, o) => sum + o.price, 0);

  const pendingDuesINR = orders
    .filter(o => o.status === 'Pending Payment')
    .reduce((sum, o) => sum + o.price, 0);

  const pendingCount = orders.filter(o => o.status === 'Pending Payment').length;

  return (
    <div className="space-y-4 pb-20 font-mono">
      {/* Telemetry Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-3 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Total Orders</span>
          <div className="text-base font-extrabold text-white mt-0.5">{orders.length}</div>
        </div>
        <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-3 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Pending Dues</span>
          <div className="text-base font-extrabold text-amber-400 mt-0.5">
            {profile.currency}{pendingDuesINR.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-[#10141e] border border-[#1e2536] rounded-2xl p-3 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Settled In Bank</span>
          <div className="text-base font-extrabold text-emerald-400 mt-0.5">
            {profile.currency}{totalCollectedINR.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Static UPI QR Payment Banner (No WhatsApp) */}
      <div className="bg-gradient-to-r from-[#121622] to-[#0d1017] border border-[#222a3d] rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm">
        <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <QrCode className="w-12 h-12 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Direct UPI On-Screen QR</span>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
              Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-bold text-amber-300 truncate">{profile.upiId}</span>
            <button
              onClick={copyVpa}
              className="px-1.5 py-0.5 rounded bg-[#1c2230] hover:bg-[#252d40] text-gray-300 text-[10px] flex items-center gap-0.5"
            >
              {copiedVpa ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              {copiedVpa ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 font-sans">
            Client scans QR directly on order completion. No third-party chat gateways required.
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-[#10141e] p-1.5 rounded-xl border border-[#1e2536] text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'all' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'pending' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex-1 py-1 rounded-lg font-bold transition ${
            filter === 'paid' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Paid ({orders.length - pendingCount})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-[#10141e] rounded-2xl border border-[#1e2536] text-xs">
            No orders match the selected filter.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPending = order.status === 'Pending Payment';
            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-[#121622] border-amber-500/40 shadow-sm'
                    : 'bg-[#10141e] border-[#1e2536] opacity-90'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{order.customerName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isPending ? 'Pending Payment' : `✓ ${order.paymentMethod} Verified`}
                      </span>
                    </div>
                    <div className="text-xs text-amber-300 font-bold mt-1">
                      {order.recipeName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      {profile.currency}{order.price.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {order.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-[#080a0f] p-2.5 rounded-xl border border-[#1a2130] space-y-1.5 text-[11px] text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Tag className="w-3 h-3" />
                      Serial: {order.bottleSerial}
                    </span>
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
                    <div className="flex items-center gap-1 text-gray-400 pt-0.5 border-t border-[#1a2130] font-sans">
                      <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="truncate">{order.deliveryNote}</span>
                    </div>
                  )}
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
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Payment Verified • Ready for Handover
                      </span>
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Pending Payment', 'Pending');
                          showToast(`Reverted ${order.orderNumber} to Pending`);
                        }}
                        className="text-[11px] text-gray-400 hover:text-white underline"
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
