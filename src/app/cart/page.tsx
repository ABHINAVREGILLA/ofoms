"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Bike,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, items, restaurant, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const deliveryFee = restaurant?.deliveryFee || 35;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST

  // Compute coupon discount if applied
  let discount = 0;
  if (appliedCoupon) {
    discount = Math.min((subtotal * appliedCoupon.discountPercent) / 100, appliedCoupon.maxDiscount);
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim())}&amount=${subtotal}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponSuccess(data.message);
      }
    } catch {
      setCouponError("Could not validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleProceedToCheckout = () => {
    if (appliedCoupon) {
      sessionStorage.setItem("ofoms_applied_coupon", appliedCoupon.code);
    } else {
      sessionStorage.removeItem("ofoms_applied_coupon");
    }
    router.push("/checkout");
  };

  if (!cart || items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Good food is always cooking! Explore our list of top Hyderabad restaurants and add your favorite dishes.
        </p>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-600/25 transition-all"
        >
          <span>Explore Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isBelowMin = restaurant && subtotal < restaurant.minOrderValue;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Review Your Selection
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Food Basket
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs text-rose-600 hover:underline font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Items & Restaurant Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant Header Card */}
          {restaurant && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <img
                  src={restaurant.coverImage}
                  alt={restaurant.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {restaurant.address} • Delivery in {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} mins
                  </p>
                </div>
              </div>

              <Link
                href={`/restaurants/${restaurant.slug || restaurant.id}`}
                className="text-xs text-orange-600 hover:underline font-bold"
              >
                + Add More
              </Link>
            </div>
          )}

          {/* Items List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Ordered Items ({items.length})
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => {
                let custText = "";
                try {
                  if (item.selectedCustomizations) {
                    const c = JSON.parse(item.selectedCustomizations);
                    custText = Object.entries(c)
                      .map(([k, v]: [string, any]) => `${k}: ${v.name || v}`)
                      .join(", ");
                  }
                } catch {}

                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-3.5 h-3.5 rounded-xs border-2 mt-1 flex items-center justify-center shrink-0 ${
                          item.menuItem?.isVeg ? "border-emerald-600" : "border-rose-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.menuItem?.isVeg ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                      </div>

                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.menuItem?.name || "Dish"}
                        </h5>
                        {custText && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {custText}
                          </p>
                        )}
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mt-1">
                          {formatCurrency(item.price)} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white w-20 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety & Hygiene Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Safe & Clean Delivery Guarantee:</strong> All meals prepared under strict FSSAI guidelines with temperature checks & tamper-proof sealing.
            </span>
          </div>
        </div>

        {/* Right Column: Bill Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Code Section */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Tag className="w-4 h-4 text-orange-600" />
              <span>Apply Coupon or Discount</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {appliedCoupon.code} Applied!
                  </span>
                  <p className="text-[11px] text-emerald-600">
                    Saved {formatCurrency(discount)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME50, BIRYANI20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 uppercase font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  {isValidatingCoupon ? "..." : "Apply"}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-rose-600 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {couponError}
              </p>
            )}
            {couponSuccess && !appliedCoupon && (
              <p className="text-emerald-600 text-[11px] font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> {couponSuccess}
              </p>
            )}

            <div className="text-[11px] text-slate-400">
              💡 Tip: Try code <strong className="text-slate-600 dark:text-slate-300">WELCOME50</strong> for 50% off
            </div>
          </div>

          {/* Bill Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Bill Breakdown
            </h4>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Taxes & Restaurant Packaging (5% GST)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(tax)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-slate-900 dark:text-white">
              <span>To Pay</span>
              <span className="text-xl text-orange-600 dark:text-orange-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {isBelowMin && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                Minimum order amount for {restaurant.name} is {formatCurrency(restaurant.minOrderValue)}. Add {formatCurrency(restaurant.minOrderValue - subtotal)} more to proceed.
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              disabled={Boolean(isBelowMin)}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
