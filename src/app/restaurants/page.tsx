"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RestaurantType } from "@/lib/types";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import {
  Search,
  Filter,
  Star,
  Clock,
  Leaf,
  SlidersHorizontal,
  X,
  Compass,
  ArrowUpDown,
} from "lucide-react";

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCuisine = searchParams.get("cuisine") || "ALL";

  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [minRating, setMinRating] = useState<number>(0);
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("rating_desc");

  const cuisinesList = [
    "ALL",
    "Biryani",
    "North Indian",
    "South Indian",
    "Pizza",
    "Burgers",
    "Chinese",
    "Desserts",
    "Mughlai",
    "Andhra",
  ];

  useEffect(() => {
    async function fetchRestaurants() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (selectedCuisine && selectedCuisine !== "ALL") queryParams.set("cuisine", selectedCuisine);
        if (minRating > 0) queryParams.set("rating", minRating.toString());
        if (isVegOnly) queryParams.set("veg", "true");
        queryParams.set("sort", sortBy);

        const res = await fetch(`/api/restaurants?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data.restaurants || []);
        }
      } catch (e) {
        console.error("Failed to load restaurants:", e);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchRestaurants, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCuisine, minRating, isVegOnly, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCuisine("ALL");
    setMinRating(0);
    setIsVegOnly(false);
    setSortBy("rating_desc");
  };

  const hasActiveFilters = search || selectedCuisine !== "ALL" || minRating > 0 || isVegOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Explore Hyderabad
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Discover Restaurants
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {restaurants.length} kitchens ready to deliver to your location
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by restaurant or dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Cuisine Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Cuisines:
          </span>
          {cuisinesList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCuisine === c
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {c === "ALL" ? "All Cuisines" : c}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pure Veg Toggle */}
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isVegOnly
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Pure Veg Only</span>
            </button>

            {/* Rating Filter */}
            <button
              onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                minRating === 4.5
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Rating 4.5+</span>
            </button>

            <button
              onClick={() => setMinRating(minRating === 4.0 ? 0 : 4.0)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                minRating === 4.0
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Rating 4.0+</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:underline font-bold px-2 py-1"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-hidden"
            >
              <option value="rating_desc">Highest Rated</option>
              <option value="delivery_asc">Fastest Delivery</option>
              <option value="reviews_desc">Most Popular</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            No restaurants match your filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, cuisine category, or clearing the pure vegetarian filter.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm">Loading restaurants...</div>}>
      <RestaurantsContent />
    </Suspense>
  );
}
