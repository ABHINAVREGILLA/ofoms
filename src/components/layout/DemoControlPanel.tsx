"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  CreditCard,
  Bike,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export function DemoControlPanel() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/demo/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || `Action ${action} executed successfully!`);
        if (data.orderId) {
          router.push(`/orders/${data.orderId}/track`);
        } else {
          router.refresh();
        }
      } else {
        showToast(`Error: ${data.error || "Action failed"}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e.message || "Execution failed"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Toast popup */}
      {message && (
        <div className="mb-2 p-3 rounded-2xl bg-slate-900 text-white text-xs font-bold border border-orange-500/50 shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Drawer Container */}
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-3xl border border-orange-500/40 shadow-2xl overflow-hidden transition-all duration-300">
        {/* Toggle Button Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-xs font-black bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-current animate-pulse text-amber-300" />
            <span className="uppercase tracking-wider">DEMO CONTROLS PANEL</span>
            <span className="bg-black/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">Presenter Mode</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Panel Actions Body */}
        {isOpen && (
          <div className="p-4 space-y-3 min-w-[280px] sm:min-w-[340px]">
            <p className="text-[11px] text-slate-400 leading-relaxed border-b border-slate-800 pb-2">
              ⚡ Quick workflow simulation tools for college project evaluation & viva demonstration.
            </p>

            <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleAction("create-order")}
                disabled={isLoading}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-orange-500 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-orange-400 group-hover:text-white" />
                  <span>1. Create Instant Order</span>
                </div>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 opacity-60" />}
              </button>

              <button
                onClick={() => handleAction("advance-latest")}
                disabled={isLoading}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-amber-500 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 group-hover:text-white" />
                  <span>2. Advance Order Status</span>
                </div>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 opacity-60" />}
              </button>

              <button
                onClick={() => handleAction("advance-latest")}
                disabled={isLoading}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-emerald-500 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Bike className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                  <span>3. Move Rider GPS Coordinates</span>
                </div>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 opacity-60" />}
              </button>

              <button
                onClick={() => handleAction("reset-seed")}
                disabled={isLoading}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-700 text-rose-300 hover:text-white transition-all border border-rose-800/60 cursor-pointer group mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-rose-400 group-hover:text-white" />
                  <span>Reset Demo Database</span>
                </div>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 opacity-60" />}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Status: Ready for demo</span>
              <span className="text-orange-400 font-bold">OFOMS v1.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
