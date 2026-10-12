"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { RestaurantType, MenuItemType } from "@/lib/types";
import { FoodCard } from "@/components/food/FoodCard";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Leaf,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { cart, itemCount, subtotal } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [activeTab, setActiveTab] = useState<"MENU" | "REVIEWS" | "ABOUT">("MENU");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurant() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/restaurants/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data.restaurant);
          if (data.restaurant?.categories && data.restaurant.categories.length > 0) {
            setActiveCategory(data.restaurant.categories[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load restaurant details:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurant();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-64 sm:h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Restaurant Not Found</h2>
        <p className="text-xs text-slate-500">We couldn't find the restaurant you were looking for.</p>
        <Link
          href="/restaurants"
          className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
        >
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const categories = restaurant.categories || [];
  const reviews = restaurant.reviews || [];

  return (
    <div className="pb-24">
      {/* Restaurant Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 flex flex-col justify-end pb-8">
          <div className="space-y-3 max-w-3xl">
            {/* Top badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-600 text-white shadow-md">
                {restaurant.cuisineType.split(",")[0]}
              </span>
              {restaurant.isVegOnly && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-md">
                  <Leaf className="w-3 h-3" /> Pure Veg
                </span>
              )}
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs">
                {restaurant.priceRange} • Min Order {formatCurrency(restaurant.minOrderValue)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {restaurant.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl line-clamp-2">
              {restaurant.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs text-white/90">
              <div className="flex items-center gap-1.5 font-bold bg-emerald-600 px-2.5 py-1 rounded-xl shadow-xs">
                <span>{restaurant.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] text-emerald-100 font-normal">
                  ({restaurant.totalReviews} reviews)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} mins</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-orange-400" />
                <span>{restaurant.deliveryFee === 0 ? "Free Delivery" : `${formatCurrency(restaurant.deliveryFee)} delivery fee`}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="sticky top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab("MENU")}
              className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "MENU"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>Full Menu</span>
            </button>

            <button
              onClick={() => setActiveTab("REVIEWS")}
              className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "REVIEWS"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>Customer Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ABOUT")}
              className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "ABOUT"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>About & Safety</span>
            </button>
          </div>

          {activeTab === "MENU" && (
            <button
              onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                vegOnlyFilter
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Veg Only</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "MENU" && (
          <div className="space-y-12">
            {categories.map((category) => {
              const items = vegOnlyFilter
                ? category.menuItems.filter((i) => i.isVeg)
                : category.menuItems;

              if (items.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      {items.length} dishes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((dish) => (
                      <FoodCard key={dish.id} item={dish} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Reviews Tab */}
        {activeTab === "REVIEWS" && (
          <div className="space-y-8 max-w-4xl">
            {/* Rating Summary Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center sm:border-r sm:border-slate-200 dark:sm:border-slate-800 sm:pr-8">
                <div className="text-5xl font-black text-slate-900 dark:text-white">
                  {restaurant.rating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-500 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Based on {restaurant.totalReviews} customer ratings
                </p>
              </div>

              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="flex items-center gap-3">
                  <span className="w-12 text-slate-500">5 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[82%]" />
                  </div>
                  <span className="w-8 text-right font-bold text-slate-600 dark:text-slate-400">82%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-12 text-slate-500">4 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[12%]" />
                  </div>
                  <span className="w-8 text-right font-bold text-slate-600 dark:text-slate-400">12%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-12 text-slate-500">3 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-400 w-[4%]" />
                  </div>
                  <span className="w-8 text-right font-bold text-slate-600 dark:text-slate-400">4%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-12 text-slate-500">2 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-400 w-[2%]" />
                  </div>
                  <span className="w-8 text-right font-bold text-slate-600 dark:text-slate-400">2%</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Recent Customer Feedback
              </h3>

              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                  <p className="text-xs text-slate-500">No customer reviews yet. Be the first to order and review!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">
                          {rev.user?.name ? rev.user.name.charAt(0) : "C"}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {rev.user?.name || "Verified Customer"}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                        <span>{rev.rating}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {rev.restaurantReply && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 text-xs">
                        <div className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Response from {restaurant.name} Manager:</span>
                        </div>
                        <p className="text-orange-800 dark:text-orange-200/90 leading-relaxed text-[11px]">
                          {rev.restaurantReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "ABOUT" && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                About {restaurant.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {restaurant.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{restaurant.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{restaurant.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Location:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{restaurant.address}, {restaurant.city} - {restaurant.postalCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">FSSAI Hygiene License:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified & Inspected
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <Link
            href="/cart"
            className="flex items-center justify-between p-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-2xl shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-orange-100">
                  {itemCount} {itemCount === 1 ? "item" : "items"} added
                </div>
                <div className="text-base font-extrabold">
                  {formatCurrency(subtotal)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 font-bold text-xs">
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
