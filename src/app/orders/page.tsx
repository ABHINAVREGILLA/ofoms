"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderType } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  ArrowRight,
  RotateCcw,
  Star,
  CheckCircle2,
  Package,
  Bike,
  Utensils,
  ChevronRight,
} from "lucide-react";
import { RatingModal } from "@/components/review/RatingModal";

export default function OrdersHistoryPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const [reviewOrder, setReviewOrder] = useState<OrderType | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = async (order: OrderType) => {
    if (!order.items || order.items.length === 0) return;
    try {
      // Add first item with clearExisting flag, then add remaining
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        if (item.menuItemId) {
          await addToCart(item.menuItemId, item.quantity, null, i === 0);
        }
      }
      router.push("/cart");
    } catch (e) {
      console.error("Reorder failed:", e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return o.status !== "DELIVERED" && o.status !== "CANCELLED";
    if (filter === "COMPLETED") return o.status === "DELIVERED";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Your Orders
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Order History
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ACTIVE", label: "Active Orders" },
            { id: "COMPLETED", label: "Past Deliveries" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Clock className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No orders found in this category
          </h3>
          <p className="text-xs text-slate-500">
            Browse our top Hyderabad eateries and place your first meal!
          </p>
          <Link
            href="/restaurants"
            className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
          >
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isActive = order.status !== "DELIVERED" && order.status !== "CANCELLED";

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    {order.restaurant?.coverImage ? (
                      <img
                        src={order.restaurant.coverImage}
                        alt={order.restaurant.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {order.restaurant?.name || "Restaurant"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Placed on {formatDate(order.createdAt)} • Ref: #{order.orderNumber}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : order.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 animate-pulse"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  {order.items?.map((it) => (
                    <div key={it.id} className="flex items-center justify-between">
                      <span>
                        {it.name} <strong className="text-slate-500">x{it.quantity}</strong>
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Controls & Total */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="text-slate-400">Total Bill: </span>
                    <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </strong>
                    <span className="text-slate-400 ml-1">({order.paymentMethod})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Tracking for Active Orders */}
                    {isActive && (
                      <Link
                        href={`/orders/${order.id}/track`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Track Live →</span>
                      </Link>
                    )}

                    {/* Reorder Button */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>

                    {/* Rate & Review Button for Delivered Orders */}
                    {order.status === "DELIVERED" && !order.review && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs font-bold"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rate Order</span>
                      </button>
                    )}

                    {/* View Details / Receipt */}
                    <Link
                      href={`/orders/${order.id}/track`}
                      className="text-xs text-slate-500 hover:text-orange-600 font-semibold p-2"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && reviewOrder.restaurant && (
        <RatingModal
          orderId={reviewOrder.id}
          restaurantId={reviewOrder.restaurantId}
          restaurantName={reviewOrder.restaurant.name}
          isOpen={Boolean(reviewOrder)}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
