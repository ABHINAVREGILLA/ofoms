"use client";

import React, { useState } from "react";
import { MenuItemType } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus, Sparkles } from "lucide-react";
import { CustomizationModal } from "./CustomizationModal";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function FoodCard({ item }: { item: MenuItemType }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Check if item is already in cart
  const cartItem = cart?.items.find((ci) => ci.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const hasCustomizations = Boolean(item.customizationsJson && item.customizationsJson.length > 5);

  const handleAddClick = async () => {
    if (hasCustomizations) {
      setIsModalOpen(true);
    } else {
      setIsAdding(true);
      await addToCart(item.id, 1);
      setIsAdding(false);
    }
  };

  const handleCustomizationConfirm = async (selectedOptions: any, totalPrice: number) => {
    setIsAdding(true);
    await addToCart(item.id, 1, selectedOptions);
    setIsAdding(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all gap-4">
        {/* Info Column */}
        <div className="flex-1 space-y-2 pr-2">
          {/* Veg / Non-Veg Indicator & Badges */}
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center ${
                item.isVeg ? "border-emerald-600" : "border-rose-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
            </div>

            {item.isPopular && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3 h-3 fill-current" /> Bestseller
              </span>
            )}
          </div>

          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            {item.name}
          </h4>

          {/* Pricing */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {formatCurrency(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(item.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Image & Add Button Column */}
        <div className="relative shrink-0 w-full sm:w-36 flex flex-col items-center">
          <div className="w-full sm:w-32 h-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
<ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          </div>

          {/* Add Button overlapping bottom of image */}
          <div className="mt-2 sm:-mt-4 relative z-10 w-28">
            {quantity > 0 && !hasCustomizations ? (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-2 border-orange-500 text-orange-600 dark:text-orange-400 rounded-xl px-2 py-1 shadow-md font-bold text-sm">
                <button
                  onClick={() => cartItem && updateQuantity(cartItem.id, quantity - 1)}
                  className="p-1 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => cartItem && updateQuantity(cartItem.id, quantity + 1)}
                  className="p-1 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                disabled={isAdding}
                className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-orange-50 dark:hover:bg-slate-800 border-2 border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all text-center"
              >
                {isAdding ? "Adding..." : "ADD"}
              </button>
            )}
          </div>

          {hasCustomizations && (
            <span className="text-[10px] text-slate-400 mt-1 font-medium">
              Customisable
            </span>
          )}
        </div>
      </div>

      <CustomizationModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCustomizationConfirm}
      />
    </>
  );
}
