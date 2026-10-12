"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { OrderType } from "@/lib/types";
import { OrderTimeline } from "@/components/tracking/OrderTimeline";
import { DeliveryMap } from "@/components/tracking/DeliveryMap";
import { RatingModal } from "@/components/review/RatingModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Phone,
  RefreshCw,
  ShoppingBag,
  Star,
  CheckCircle2,
  Sparkles,
  MapPin,
  Utensils,
} from "lucide-react";

export default function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error("Order fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Real-time synchronization polling every 5 seconds
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSimulateNext = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/simulate-next`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error("Simulation failed:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
          Connecting to Live Order Telemetry...
        </h3>
        <p className="text-xs text-slate-500">Syncing with Hyderabad GPS dispatch system</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <Link href="/orders" className="text-orange-600 text-xs font-bold underline">
          Go to Order History
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Navigation & Order Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span>Tracking Order #{order.orderNumber}</span>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
              {order.status}
            </span>
          </h1>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrder}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2"
            title="Refresh order status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {isDelivered && !order.review && (
            <button
              onClick={() => setIsRatingOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Rate & Review Food</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Visual Progress Timeline */}
      <OrderTimeline status={order.status} createdAt={order.createdAt} />

      {/* 2. Interactive Map & Delivery Movement */}
      <DeliveryMap order={order} onSimulateNext={handleSimulateNext} />

      {/* 3. Order Summary & Items Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Items & Cooking instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Items from {order.restaurant?.name}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-slate-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {order.specialInstructions && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                <strong>Cooking instructions:</strong> "{order.specialInstructions}"
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Bill & Destination */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Receipt Details
            </h4>

            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total Paid ({order.paymentMethod})</span>
              <span className="text-orange-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {order.restaurant && (
        <RatingModal
          orderId={order.id}
          restaurantId={order.restaurantId}
          restaurantName={order.restaurant.name}
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          onSuccess={() => {
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}
