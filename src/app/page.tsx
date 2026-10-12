"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RestaurantType, MenuItemType } from "@/lib/types";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { FoodCard } from "@/components/food/FoodCard";
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  Bike,
  Utensils,
  ChevronRight,
  Tag,
  Copy,
  Check,
  Star,
  Award,
  Compass,
} from "lucide-react";

const CATEGORIES = [
  { name: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80", count: "12+ Places" },
  { name: "North Indian", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&auto=format&fit=crop&q=80", count: "8+ Places" },
  { name: "South Indian", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", count: "10+ Places" },
  { name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80", count: "6+ Places" },
  { name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80", count: "5+ Places" },
  { name: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80", count: "7+ Places" },
  { name: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format&fit=crop&q=80", count: "9+ Places" },
  { name: "Mughlai", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80", count: "4+ Places" },
];

const PROMOS = [
  { code: "WELCOME50", title: "50% OFF FIRST ORDER", desc: "Up to ₹100 discount on your first meal", bg: "from-orange-500 to-amber-600" },
  { code: "BIRYANI20", title: "20% OFF HYDERABADI DUM", desc: "Save up to ₹150 on authentic royal biryanis", bg: "from-rose-500 to-orange-600" },
  { code: "OFOMS100", title: "FLAT ₹100 SAVINGS", desc: "On family orders above ₹499", bg: "from-indigo-600 to-blue-600" },
];

export default function HomePage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [popularDishes, setPopularDishes] = useState<MenuItemType[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/restaurants");
        if (res.ok) {
          const data = await res.json();
          const list = data.restaurants || [];
          setRestaurants(list);

          if (list.length > 0) {
            const firstSlug = list[0].slug;
            const r1 = await fetch(`/api/restaurants/${firstSlug}`);
            if (r1.ok) {
              const d1 = await r1.json();
              const items: MenuItemType[] = [];
              d1.restaurant?.categories?.forEach((cat: any) => {
                cat.menuItems?.forEach((item: any) => {
                  if (items.length < 6) items.push(item);
                });
              });
              setPopularDishes(items);
            }
          }
        }
      } catch (e) {
        console.error("Home page load failed:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "VEG") return r.isVegOnly;
    if (activeFilter === "BIRYANI") return r.cuisineType.toLowerCase().includes("biryani");
    if (activeFilter === "RATED") return r.rating >= 4.7;
    return true;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Hyderabad’s Premier Food Delivery Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Craving Delicious Food? <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Delivered in 30 Mins.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Order from legendary kitchens in Hyderabad. Authentic Hyderabadi Dum Biryani, crispy dosas, woodfired pizzas, and street snacks with live GPS route tracking.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="max-w-xl mx-auto relative flex items-center shadow-xl rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/40 p-1.5 focus-within:border-orange-500 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search Biryani, Bawarchi, Dosa, Pizza, Burger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/30 transition-all shrink-0 cursor-pointer"
              >
                Search Food
              </button>
            </form>

            {/* Quick Stats Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Hygiene Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Average 28 Min Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-blue-500" />
                <span>Live GPS Map Simulation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Exclusive Offers & Deals
            </h2>
          </div>
          <span className="text-xs text-slate-500">Click coupon to copy code</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROMOS.map((promo) => (
            <div
              key={promo.code}
              onClick={() => handleCopy(promo.code)}
              className={`p-5 rounded-3xl bg-gradient-to-r ${promo.bg} text-white shadow-lg shadow-orange-600/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between relative overflow-hidden group`}
            >
              <div className="space-y-1.5 relative z-10">
                <span className="text-[11px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full inline-block">
                  Special Offer
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl">
                  {promo.title}
                </h3>
                <p className="text-xs text-white/90">
                  {promo.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between relative z-10">
                <div className="font-mono font-bold tracking-widest text-sm bg-black/30 px-3 py-1.5 rounded-xl border border-white/20">
                  {promo.code}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  {copiedCode === promo.code ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What are you craving? Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Food Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              What are you craving today?
            </h2>
          </div>
          <Link
            href="/restaurants"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/restaurants?cuisine=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Top Rated in Hyderabad
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Popular Restaurants Near You
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: "All" },
              { id: "BIRYANI", label: "Biryani Special" },
              { id: "VEG", label: "Pure Veg" },
              { id: "RATED", label: "Rating 4.7+" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === f.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Utensils className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No restaurants found</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing your filter selection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Dishes with Quick Add */}
      {popularDishes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-600" />
              <div>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                  City Favorites
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Trending Dishes in Hyderabad
                </h2>
              </div>
            </div>
            <Link
              href="/restaurants/paradise-biryani-palace"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Explore Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularDishes.map((dish) => (
              <FoodCard key={dish.id} item={dish} />
            ))}
          </div>
        </section>
      )}

      {/* How OFOMS Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Seamless Ordering Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              How OFOMS Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From hungry cravings to steaming hot food at your doorstep in four transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Explore Restaurants",
                desc: "Browse 10+ top Hyderabad eateries filtered by cuisine, rating, price, and vegetarian preference.",
                icon: Compass,
              },
              {
                step: "02",
                title: "Customize & Checkout",
                desc: "Select portion sizes, spice levels, apply coupons, and checkout using simulated UPI or Cards.",
                icon: Utensils,
              },
              {
                step: "03",
                title: "Kitchen Preparation",
                desc: "Restaurant managers review incoming queues and update states from Accepted to Ready for Pickup.",
                icon: Clock,
              },
              {
                step: "04",
                title: "Live GPS Tracking",
                desc: "Watch the delivery partner navigate Hyderabad streets in real-time until safe handover.",
                icon: Bike,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 relative">
                  <div className="text-4xl font-black text-slate-700 absolute top-4 right-4 select-none">
                    {s.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
