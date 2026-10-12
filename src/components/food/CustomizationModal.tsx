"use client";

import React, { useState } from "react";
import { MenuItemType, CustomizationGroup } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { X, Check } from "lucide-react";

interface CustomizationModalProps {
  item: MenuItemType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: any, totalPrice: number) => void;
}

export function CustomizationModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: CustomizationModalProps) {
  if (!isOpen) return null;

  let groups: CustomizationGroup[] = [];
  try {
    if (item.customizationsJson) {
      groups = JSON.parse(item.customizationsJson);
    }
  } catch {}

  const [selections, setSelections] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    groups.forEach((g) => {
      if (g.options && g.options.length > 0) {
        // Default to first option for single select
        initial[g.name] = g.options[0];
      }
    });
    return initial;
  });

  // Calculate total price based on selections
  let extraCost = 0;
  Object.values(selections).forEach((val) => {
    if (val && typeof val.extraPrice === "number") {
      extraCost += val.extraPrice;
    }
  });

  const finalUnitPrice = item.price + extraCost;

  const handleSelect = (groupName: string, option: any) => {
    setSelections((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const handleConfirm = () => {
    onConfirm(selections, finalUnitPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Customise Your Dish
            </span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {item.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Groups list */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {groups.map((g) => (
            <div key={g.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {g.name}
                </h4>
                <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>

              <div className="space-y-2">
                {g.options.map((opt) => {
                  const isSelected = selections[g.name]?.name === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => handleSelect(g.name, opt)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-sm font-medium transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-950 dark:text-orange-200 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-orange-600 bg-orange-600 text-white"
                              : "border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.extraPrice > 0 ? `+${formatCurrency(opt.extraPrice)}` : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Item Price</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(finalUnitPrice)}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Add to Cart • {formatCurrency(finalUnitPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
