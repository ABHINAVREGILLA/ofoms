"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Store, Save, Check, ShieldCheck, MapPin, Clock, Bike } from "lucide-react";

export default function AdminSettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [minOrder, setMinOrder] = useState("200");
  const [deliveryFee, setDeliveryFee] = useState("35");
  const [deliveryMin, setDeliveryMin] = useState("25");
  const [deliveryMax, setDeliveryMax] = useState("35");
  const [cuisine, setCuisine] = useState("Biryani, North Indian, Mughlai");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
          Store Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Restaurant Profile & Timings
        </h1>
        <p className="text-xs text-slate-500">
          Control operational parameters, delivery fee structures, and kitchen open/closed toggles
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        {/* Open / Closed Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
              Accepting Orders Online
            </span>
            <p className="text-xs text-slate-500">
              When turned off, customers will see restaurant marked as "Currently Closed".
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isOpen
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-rose-600 text-white shadow-xs"
            }`}
          >
            {isOpen ? "Store Open" : "Store Closed"}
          </button>
        </div>

        {/* Operational Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Minimum Order Value (₹)
            </label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Standard Delivery Partner Fee (₹)
            </label>
            <input
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Min Delivery Time (Minutes)
            </label>
            <input
              type="number"
              value={deliveryMin}
              onChange={(e) => setDeliveryMin(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Max Delivery Time (Minutes)
            </label>
            <input
              type="number"
              value={deliveryMax}
              onChange={(e) => setDeliveryMax(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-semibold mb-1">
              Cuisine Tags (Comma-Separated)
            </label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>

          {saved && (
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings Updated!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
