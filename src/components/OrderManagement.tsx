import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReceiptText, QrCode, CheckCircle, Clock, Banknote, Phone, MapPin, Tag } from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, profile } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'pending') return o.status === 'Pending Payment';
    if (filter === 'paid') return o.status === 'Paid' || o.status === 'Delivered';
    return true;
  });

  const totalRevenue = orders.filter(o => o.status !== 'Pending Payment').reduce((sum, o) => sum + o.price, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending Payment').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-3 text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Orders</span>
          <div className="text-base font-bold text-white mt-0.5">{orders.length}</div>
        </div>
        <div className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-3 text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Pending</span>
          <div className="text-base font-bold text-amber-400 mt-0.5">{pendingCount}</div>
        </div>
        <div className="bg-[#171b24] border border-[#262c3b] rounded-2xl p-3 text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Collected</span>
          <div className="text-base font-bold text-emerald-400 mt-0.5">{profile.currency}{totalRevenue}</div>
        </div>
      </div>

      {/* Static UPI QR Payment Banner */}
      <div className="bg-gradient-to-r from-[#1b2230] to-[#161a24] border border-[#2d3547] rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
        <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <QrCode className="w-12 h-12 text-black" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">Direct UPI On-Screen QR</span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
              Live
            </span>
          </div>
          <div className="text-[11px] font-mono text-amber-300 font-medium truncate mt-0.5">
            {profile.upiId}
          </div>
          <p className="text-[10px] text-gray-400">
            Customers view this QR directly upon submitting order link. No messaging integration required.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-[#171b24] p-1.5 rounded-xl border border-[#262c3b] text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg font-medium transition ${
            filter === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1 rounded-lg font-medium transition ${
            filter === 'pending' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex-1 py-1 rounded-lg font-medium transition ${
            filter === 'paid' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          Paid ({orders.length - pendingCount})
        </button>
      </div>

      {/* Order Cards List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-[#171b24] rounded-2xl border border-[#262c3b] text-xs">
            No orders match this filter.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPending = order.status === 'Pending Payment';
            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-[#1a1b24] border-amber-500/40 shadow-sm'
                    : 'bg-[#171b24] border-[#252a36] opacity-90'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{order.customerName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {isPending ? 'Pending Payment' : `✓ ${order.paymentMethod} Paid`}
                      </span>
                    </div>
                    <div className="text-xs text-amber-300 font-semibold mt-0.5">
                      {order.recipeName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      {profile.currency}{order.price.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {order.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Bottle Serial & Delivery Note */}
                <div className="bg-[#12151c] p-2.5 rounded-xl border border-[#252b38] space-y-1 text-[11px] text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Tag className="w-3 h-3" />
                      Assigned: {order.bottleSerial}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      {order.customerPhone || 'Direct Client'}
                    </span>
                  </div>

                  {order.deliveryNote && (
                    <div className="flex items-center gap-1 text-gray-400 pt-0.5 border-t border-[#252b38]">
                      <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="truncate">{order.deliveryNote}</span>
                    </div>
                  )}
                </div>

                {/* Maker Action Buttons */}
                <div className="pt-3 mt-3 border-t border-[#252a36] flex items-center justify-between gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Paid', 'UPI');
                          showToast(`Marked ${order.customerName}'s order as UPI Paid!`);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        ✓ UPI Received
                      </button>

                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Paid', 'Cash');
                          showToast(`Recorded Cash Payment for ${order.customerName}!`);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-[#222838] hover:bg-[#2b3347] text-gray-200 text-xs font-semibold flex items-center justify-center gap-1 border border-[#313a50] active:scale-95 transition"
                      >
                        <Banknote className="w-3.5 h-3.5 text-amber-400" />
                        Cash Paid
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirmed • {order.paymentMethod}
                      </span>
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Pending Payment', 'Pending');
                          showToast(`Reset ${order.orderNumber} back to Pending`);
                        }}
                        className="text-[11px] text-gray-400 hover:text-white underline"
                      >
                        Revert to Pending
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
