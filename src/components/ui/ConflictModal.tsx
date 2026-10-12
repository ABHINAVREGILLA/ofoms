"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { AlertCircle, Trash2, ArrowRight } from "lucide-react";

export function ConflictModal() {
  const { conflictData, resolveConflict } = useCart();

  if (!conflictData || !conflictData.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-amber-500 mb-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Replace Cart Items?
          </h3>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
          Your cart currently has dishes from <span className="font-semibold text-slate-900 dark:text-white">{conflictData.currentRestaurantName}</span>.
          According to delivery standards, you can only order from one restaurant at a time.
          <br /><br />
          Would you like to discard the existing items and add from <span className="font-semibold text-orange-600 dark:text-orange-400">{conflictData.newRestaurantName}</span>?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => resolveConflict(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Keep Existing Cart
          </button>
          <button
            onClick={() => resolveConflict(true)}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear & Add New
          </button>
        </div>
      </div>
    </div>
  );
}
