"use client";

import React, { useState } from "react";
import { OrderType } from "@/lib/types";
import { MapPin, Bike, Store, Phone, CheckCircle, Navigation, Play, RefreshCw } from "lucide-react";

interface DeliveryMapProps {
  order: OrderType;
  onSimulateNext?: () => Promise<void>;
}

export function DeliveryMap({ order, onSimulateNext }: DeliveryMapProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  const status = order.status;
  const isDelivered = status === "DELIVERED";
  const isOut = status === "OUT_FOR_DELIVERY";

  // Coordinates computation for SVG canvas
  // Restaurant is left-bottom, customer is right-top
  const restX = 80;
  const restY = 280;
  const custX = 520;
  const custY = 80;

  // Compute rider position along bezier curve
  let fraction = 0;
  if (status === "PLACED" || status === "ACCEPTED" || status === "PREPARING") {
    fraction = 0;
  } else if (status === "READY_FOR_PICKUP") {
    fraction = 0.15;
  } else if (status === "OUT_FOR_DELIVERY") {
    fraction = 0.65;
  } else if (status === "DELIVERED") {
    fraction = 1.0;
  }

  // Curve control point
  const ctrlX = 220;
  const ctrlY = 120;

  // Quadratic bezier point: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
  const t = fraction;
  const riderX = Math.round(Math.pow(1 - t, 2) * restX + 2 * (1 - t) * t * ctrlX + Math.pow(t, 2) * custX);
  const riderY = Math.round(Math.pow(1 - t, 2) * restY + 2 * (1 - t) * t * ctrlY + Math.pow(t, 2) * custY);

  const handleSimulateClick = async () => {
    if (!onSimulateNext) return;
    setIsSimulating(true);
    try {
      await onSimulateNext();
    } finally {
      setIsSimulating(false);
    }
  };

  const rider = order.deliveryAssignment?.deliveryPersonnel || {
    name: "Raju Delivery Partner",
    phone: "+91 99887 66554",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  };

  let addressInfo = { street: "Cyber Towers Area", area: "Madhapur, Hyderabad" };
  try {
    if (order.deliveryAddressJson) {
      addressInfo = JSON.parse(order.deliveryAddressJson);
    }
  } catch {}

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      {/* Top Map Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
            <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Live Delivery GPS Tracking (Simulated)
            </h3>
            <p className="text-[11px] text-slate-500">
              Hyderabad Corridor: {order.restaurant?.name || "Kitchen"} → {addressInfo.area || "Destination"}
            </p>
          </div>
        </div>

        {/* Demo Simulation Button */}
        {onSimulateNext && (
          <button
            onClick={handleSimulateClick}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition-all active:scale-95 cursor-pointer"
            title="Advance order lifecycle to the next step for college project demonstration"
          >
            {isSimulating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Simulate Next Status 🚀</span>
          </button>
        )}
      </div>

      {/* Simulated Map Canvas */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {/* Hyderabad Grid Map Canvas */}
        <svg
          viewBox="0 0 600 360"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Street Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" />
            </pattern>
            {/* Pulsing ring for delivery rider */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Major Hyderabad Roads */}
          <path d="M -10 160 C 180 180, 380 120, 610 140" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-300 dark:text-slate-800" />
          <path d="M 280 -10 C 290 150, 270 250, 310 370" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-300 dark:text-slate-800" />

          {/* Road labels */}
          <text x="20" y="150" fill="currentColor" fontSize="8" className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">
            Madhapur Main Rd (Cyber Towers)
          </text>
          <text x="320" y="220" fill="currentColor" fontSize="8" className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">
            Hitech City Flyover
          </text>

          {/* Planned Delivery Route Polyline / Curve */}
          <path
            d={`M ${restX} ${restY} Q ${ctrlX} ${ctrlY} ${custX} ${custY}`}
            fill="none"
            stroke="#ff5722"
            strokeWidth="4"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Completed Segment of Route */}
          <path
            d={`M ${restX} ${restY} Q ${restX + (ctrlX - restX) * t} ${restY + (ctrlY - restY) * t} ${riderX} ${riderY}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
          />

          {/* Restaurant Marker */}
          <g transform={`translate(${restX}, ${restY})`} className="cursor-pointer">
            <circle r="22" fill="#f97316" fillOpacity="0.2" />
            <circle r="14" fill="#ea580c" />
            <circle r="6" fill="#ffffff" />
            <text x="0" y="32" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" className="text-slate-800 dark:text-slate-200">
              {order.restaurant?.name ? order.restaurant.name.slice(0, 16) : "Kitchen"}
            </text>
          </g>

          {/* Customer Destination Marker */}
          <g transform={`translate(${custX}, ${custY})`} className="cursor-pointer">
            <circle r="24" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle r="16" fill="#2563eb" />
            <circle r="7" fill="#ffffff" />
            <text x="0" y="32" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" className="text-slate-800 dark:text-slate-200">
              Delivery Destination
            </text>
          </g>

          {/* Delivery Rider Marker */}
          <g
            transform={`translate(${riderX}, ${riderY})`}
            className="transition-all duration-700 ease-out cursor-pointer"
          >
            <circle r="26" fill="#10b981" fillOpacity="0.3" className="animate-ping" style={{ animationDuration: "2s" }} />
            <circle r="18" fill="#059669" filter="url(#glow)" />
            {/* Bike icon representation */}
            <circle r="12" fill="#ffffff" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#059669">
              🛵
            </text>
            <text x="0" y="-24" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" className="text-emerald-600 dark:text-emerald-400">
              {status === "DELIVERED" ? "Arrived!" : "Rider (Raju)"}
            </text>
          </g>
        </svg>

        {/* ETA Overlay Pill */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 text-xs flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isDelivered ? "Delivered" : isOut ? "Estimated Arrival: 12-15 Mins" : "Estimated Delivery: 30 Mins"}
            </span>
            <p className="text-[11px] text-slate-500">
              {isDelivered ? "Order successfully handed over" : "Live GPS route tracking active"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Rider Contact Details */}
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3.5">
          <img
            src={rider.avatar || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"}
            alt={rider.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {rider.name}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                Verified Partner
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Bajaj Pulsar • TS 09 EC 4102 • Vaccinated & Sanitized
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href={`tel:${rider.phone || "+919988766554"}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Call Partner</span>
          </a>
        </div>
      </div>
    </div>
  );
}
