"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/types";
import { ShieldCheck, UserCheck, Utensils, Bike, LayoutDashboard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function RoleBanner() {
  const { user, switchDemoRole } = useAuth();
  const pathname = usePathname();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; path: string }[] = [
    { role: "CUSTOMER", label: "Customer", icon: <UserCheck className="w-3.5 h-3.5" />, path: "/" },
    { role: "RESTAURANT_MANAGER", label: "Restaurant", icon: <Utensils className="w-3.5 h-3.5" />, path: "/admin" },
    { role: "DELIVERY_PERSONNEL", label: "Delivery", icon: <Bike className="w-3.5 h-3.5" />, path: "/delivery" },
    { role: "SYSTEM_ADMIN", label: "Platform Admin", icon: <LayoutDashboard className="w-3.5 h-3.5" />, path: "/system-admin" },
  ];

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">OFOMS Prototype Demo Mode:</span>
          {user ? (
            <span className="text-slate-400">
              Active: <strong className="text-white">{user.name}</strong> (<span className="text-orange-400 font-medium">{user.role}</span>)
            </span>
          ) : (
            <span className="text-slate-400">Guest Visitor</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 mr-1">Switch Role:</span>
          {roles.map((r) => {
            const isActive = user?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchDemoRole(r.role)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                  isActive
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                title={`Switch demo login to ${r.label}`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}

          {user && (
            <div className="border-l border-slate-700 pl-2 ml-1">
              {user.role === "RESTAURANT_MANAGER" || user.role === "RESTAURANT_STAFF" ? (
                <Link
                  href="/admin"
                  className="text-orange-400 hover:text-orange-300 flex items-center gap-0.5 font-medium underline-offset-2 hover:underline"
                >
                  Go to Restaurant Dashboard <ChevronRight className="w-3 h-3" />
                </Link>
              ) : user.role === "DELIVERY_PERSONNEL" ? (
                <Link
                  href="/delivery"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-medium underline-offset-2 hover:underline"
                >
                  Go to Delivery App <ChevronRight className="w-3 h-3" />
                </Link>
              ) : user.role === "SYSTEM_ADMIN" ? (
                <Link
                  href="/system-admin"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium underline-offset-2 hover:underline"
                >
                  Go to Admin Panel <ChevronRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className="text-slate-300 hover:text-white flex items-center gap-0.5 font-medium underline-offset-2 hover:underline"
                >
                  My Orders <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
