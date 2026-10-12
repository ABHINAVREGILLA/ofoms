"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  Bike,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

export default function AdminOrdersQueuePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setCounts(data.counts || {});
      }
    } catch (e) {
      console.error("Queue fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // 4-second polling for live sync
    return () => clearInterval(interval);
  }, [filter]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.items?.some((it: any) => it.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Kitchen Operations Queue
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Live Orders Management
          </h1>
          <p className="text-xs text-slate-500">
            Real-time state synchronization. Status changes instantly update customer live tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "ALL", label: "All Orders", count: counts.all || 0 },
            { id: "PLACED", label: "New (Placed)", count: counts.placed || 0 },
            { id: "ACCEPTED", label: "Accepted", count: counts.accepted || 0 },
            { id: "PREPARING", label: "Cooking", count: counts.preparing || 0 },
            { id: "READY_FOR_PICKUP", label: "Ready", count: counts.ready || 0 },
            { id: "OUT_FOR_DELIVERY", label: "On Road", count: counts.outForDelivery || 0 },
            { id: "DELIVERED", label: "Delivered", count: counts.delivered || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === tab.id
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === tab.id
                    ? "bg-white/30 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Queue Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No orders in this queue
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            New orders from customer checkouts will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            let addr = { area: "Madhapur", street: "Flat 402" };
            try {
              if (o.deliveryAddressJson) addr = JSON.parse(o.deliveryAddressJson);
            } catch {}

            return (
              <div
                key={o.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      #{o.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Placed at {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-xs text-slate-400">• Customer: <strong className="text-slate-800 dark:text-slate-200">{o.user?.name || "Customer"}</strong> ({o.user?.phone || "+91 98765 43210"})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        o.status === "PLACED"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 animate-pulse"
                          : o.status === "ACCEPTED"
                          ? "bg-blue-100 text-blue-700"
                          : o.status === "PREPARING"
                          ? "bg-orange-100 text-orange-700"
                          : o.status === "READY_FOR_PICKUP"
                          ? "bg-purple-100 text-purple-700"
                          : o.status === "OUT_FOR_DELIVERY"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Items & Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">
                      Items Ordered
                    </span>
                    <div className="space-y-1">
                      {o.items?.map((it: any) => (
                        <div key={it.id} className="flex justify-between max-w-md">
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {it.name} <strong className="text-slate-400">x{it.quantity}</strong>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {o.specialInstructions && (
                      <p className="text-[11px] text-orange-600 bg-orange-50 dark:bg-orange-950/30 p-2 rounded-xl mt-2 font-medium">
                        Note: "{o.specialInstructions}"
                      </p>
                    )}
                  </div>

                  {/* Destination & Payment */}
                  <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">
                      Delivery Destination
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {addr.street}, {addr.area}
                    </p>
                    <p className="text-slate-500 pt-1">
                      Paid via <strong>{o.paymentMethod}</strong> • Total: <strong className="text-slate-900 dark:text-white">{formatCurrency(o.total)}</strong>
                    </p>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Assigned Partner: {o.deliveryAssignment?.deliveryPersonnel?.name || "Raju (Auto-Assigned)"}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Accept Order */}
                    {o.status === "PLACED" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(o.id, "ACCEPTED")}
                          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, "CANCELLED")}
                          className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Start Preparing */}
                    {o.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "PREPARING")}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 flex items-center gap-1.5"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {/* Mark Ready */}
                    {o.status === "PREPARING" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "READY_FOR_PICKUP")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Ready For Pickup</span>
                      </button>
                    )}

                    {/* Rider Out for Delivery */}
                    {o.status === "READY_FOR_PICKUP" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "OUT_FOR_DELIVERY")}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Handover to Rider</span>
                      </button>
                    )}

                    {/* Mark Delivered */}
                    {o.status === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "DELIVERED")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm Delivered</span>
                      </button>
                    )}

                    <Link
                      href={`/orders/${o.id}/track`}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                      Track Live View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
