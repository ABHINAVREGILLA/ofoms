"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Bike,
  MapPin,
  Store,
  Phone,
  CheckCircle2,
  Package,
  Navigation,
  RefreshCw,
  IndianRupee,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DeliveryDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/delivery/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error("Delivery fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (assignmentId: string, action: string) => {
    try {
      const res = await fetch(`/api/delivery/assignments/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchDeliveries();
      }
    } catch (e) {
      console.error("Delivery action error:", e);
    }
  };

  const activeDeliveries = assignments.filter((a) => a.status !== "DELIVERED");
  const completedDeliveries = assignments.filter((a) => a.status === "DELIVERED");
  const displayed = activeTab === "ACTIVE" ? activeDeliveries : completedDeliveries;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header with Rider Status & Earnings */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                Zara Rider <span className="text-sm font-normal text-emerald-400">[Demo Partner]</span>
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online & Available
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              [DEMO] Fictional Fleet • Zone: Prototype City • Vehicle: DV-0001
            </p>
          </div>
        </div>

        {/* Quick Shift Stats */}
        <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Today's Earnings</span>
            <span className="text-xl font-black text-emerald-400">₹840.00</span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-slate-400 block font-medium">Completed Trips</span>
            <span className="text-xl font-black text-white">{completedDeliveries.length + 5}</span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-slate-400 block font-medium">Rider Rating</span>
            <span className="text-xl font-black text-amber-400">4.9 ★</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ACTIVE"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Active Deliveries ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "COMPLETED"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Completed History ({completedDeliveries.length})
          </button>
        </div>

        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Deliveries List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Bike className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            {activeTab === "ACTIVE" ? "No active delivery assignments right now" : "No completed deliveries"}
          </h3>
          <p className="text-xs text-slate-500">
            Keep this screen open. When a customer places an order, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayed.map((assignment) => {
            const order = assignment.order;
            let addr = { street: "Cyber Towers Area", area: "Madhapur, Hyderabad", recipient: "Customer", phone: "" };
            try {
              if (order?.deliveryAddressJson) addr = JSON.parse(order.deliveryAddressJson);
            } catch {}

            return (
              <div
                key={assignment.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                      Order #{order?.orderNumber || "OF-ORDER"}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      Trip Fee: <strong className="text-emerald-600">₹{order?.deliveryFee || 35} + ₹20 Bonus</strong>
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      assignment.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700 animate-pulse"
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>

                {/* Pickup & Drop Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Pickup (Restaurant) */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-orange-600 font-bold">
                      <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <Store className="w-4 h-4" /> 1. Pickup Kitchen
                      </span>
                      <a
                        href={`tel:${order?.restaurant?.phone || "+914023456780"}`}
                        className="text-slate-500 hover:text-orange-600 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Kitchen
                      </a>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {order?.restaurant?.name || "Kitchen"}
                    </h4>
                    <p className="text-slate-500">
                      {order?.restaurant?.address || "Hyderabad"}
                    </p>
                  </div>

                  {/* Dropoff (Customer) */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-blue-600 font-bold">
                      <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <MapPin className="w-4 h-4" /> 2. Delivery Destination
                      </span>
                      <a
                        href={`tel:${addr.phone || "+919876543210"}`}
                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Customer
                      </a>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {addr.recipient}
                    </h4>
                    <p className="text-slate-500">
                      {addr.street}, {addr.area}
                    </p>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Bag Contents: </span>
                  {order?.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(", ")}
                </div>

                {/* Rider Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/orders/${order?.id}/track`}
                    className="text-xs text-slate-500 hover:text-orange-600 font-semibold"
                  >
                    View Map Navigation →
                  </Link>

                  <div className="flex items-center gap-2">
                    {assignment.status === "ASSIGNED" && (
                      <button
                        onClick={() => handleAction(assignment.id, "ACCEPT")}
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md"
                      >
                        Accept Assignment
                      </button>
                    )}

                    {assignment.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleAction(assignment.id, "PICK_UP")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Confirm Food Picked Up</span>
                      </button>
                    )}

                    {assignment.status === "PICKED_UP" && (
                      <button
                        onClick={() => handleAction(assignment.id, "OUT_FOR_DELIVERY")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Start Driving (Out for Delivery)</span>
                      </button>
                    )}

                    {assignment.status === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() => handleAction(assignment.id, "DELIVER")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Order as Delivered</span>
                      </button>
                    )}
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
