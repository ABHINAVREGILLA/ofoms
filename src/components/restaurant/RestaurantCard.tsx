"use client";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import React from "react";
import Link from "next/link";
import { RestaurantType } from "@/lib/types";
import { Star, Clock, Bike, Leaf } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantType }) {
  return (
    <Link
      href={`/restaurants/${restaurant.slug || restaurant.id}`}
      className="group block bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <ImageWithFallback
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {restaurant.isVegOnly && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-md">
              <Leaf className="w-3 h-3" /> Pure Veg
            </span>
          )}
          {!restaurant.isOpen && (
            <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-md">
              Closed
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-xl bg-slate-950/70 text-white text-xs font-semibold backdrop-blur-xs">
            {restaurant.priceRange}
          </span>
        </div>

        {/* Bottom Banner Over Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} mins</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            <Bike className="w-3.5 h-3.5 text-orange-400" />
            <span>{restaurant.deliveryFee === 0 ? "Free Delivery" : formatCurrency(restaurant.deliveryFee)}</span>
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-xs font-bold shrink-0">
            <span>{restaurant.rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
          {restaurant.cuisineType}
        </p>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
          {restaurant.address}
        </p>
      </div>
    </Link>
  );
}
