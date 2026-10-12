"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { OrderType } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  ArrowRight,
  ShoppingBag,
  Share2,
} from "lucide-react";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff471a", "#ffab00", "#10b981", "#3b82f6"],
      });
    } catch {}

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (e) {
        console.error("Fetch order error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <Link href="/" className="text-orange-600 text-xs font-bold underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce-subtle">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          Payment Successful
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Order Placed Successfully!
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Thank you for ordering. The kitchen at{" "}
          <strong className="text-slate-800 dark:text-slate-200">{order.restaurant?.name}</strong> has received your order and is getting ready.
        </p>
      </div>

      {/* Primary Action: Track Order Live */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/orders/${order.id}/track`}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Bike className="w-5 h-5" />
          <span>Track Order in Real-Time →</span>
        </Link>

        <Link
          href="/orders"
          className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-xs text-slate-700 dark:text-slate-300 text-center transition-colors"
        >
          View All Orders
        </Link>
      </div>

      {/* Order Details Receipt Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Order Reference
            </span>
            <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
              #{order.orderNumber}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Estimated Delivery
            </span>
            <span className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
              <Clock className="w-4 h-4" /> 30-35 mins
            </span>
          </div>
        </div>

        {/* Ordered items list */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Items Ordered
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
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
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Partner Fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST & Packaging</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
            <span>Total Paid ({order.paymentMethod})</span>
            <span className="text-orange-600">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
