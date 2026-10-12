"use client";

import React from "react";
import { OrderStatus } from "@/lib/types";
import { Check, Clock, ChefHat, Package, Bike, PartyPopper } from "lucide-react";

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
}

const STEPS: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
  { key: "PLACED", label: "Order Placed", desc: "We have received your order", icon: Clock },
  { key: "ACCEPTED", label: "Accepted", desc: "Restaurant confirmed order", icon: Check },
  { key: "PREPARING", label: "Preparing", desc: "Chefs are cooking your meal", icon: ChefHat },
  { key: "READY_FOR_PICKUP", label: "Ready", desc: "Packed & waiting for rider", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "On The Way", desc: "Rider is heading to your address", icon: Bike },
  { key: "DELIVERED", label: "Delivered", desc: "Food delivered. Enjoy your meal!", icon: PartyPopper },
];

export function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeStep = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Live Order Status
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {STEPS[activeStep]?.label || status}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {STEPS[activeStep]?.desc}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            {status}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative">
        {/* Horizontal Connector Line for Desktop */}
        <div className="hidden md:block absolute top-6 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
          <div
            className="h-full bg-orange-500 transition-all duration-700 ease-out"
            style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-2 relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex md:flex-col items-center md:text-center gap-4 md:gap-3"
              >
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : isCurrent
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/40 ring-4 ring-orange-200 dark:ring-orange-950/60 animate-pulse-glow scale-110"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div className="md:px-1">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-orange-600 dark:text-orange-400 font-extrabold"
                        : isCompleted
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-tight mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
