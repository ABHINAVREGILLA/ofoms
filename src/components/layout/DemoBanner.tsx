"use client";

import React, { useState } from "react";
import { FlaskConical, X, AlertTriangle } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative z-50 bg-amber-500 text-amber-950"
      role="alert"
      aria-label="Demo prototype notice"
    >
      {/* Top ticker bar */}
      <div className="flex items-center justify-between px-4 py-2 gap-3 text-xs font-bold flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <span className="flex items-center gap-1.5 shrink-0 bg-amber-950 text-amber-300 px-2.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wide">
            <FlaskConical className="w-3.5 h-3.5" />
            DEMO / PROTOTYPE
          </span>
          <span className="text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            All restaurants, menus, customers, orders, payments, and delivery data on this platform are{" "}
            <strong>100% fictional</strong> and created for a{" "}
            <strong>college Software Engineering project (OFOMS)</strong>.{" "}
            No real businesses, real people, or real payments are involved.
            All data is simulated.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-full hover:bg-amber-400 transition-colors"
          aria-label="Dismiss demo notice"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
