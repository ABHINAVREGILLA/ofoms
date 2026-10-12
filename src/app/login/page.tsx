"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  UtensilsCrossed,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Bike,
  Store,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("customer@ofoms.demo");
  const [password, setPassword] = useState("demo123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "CUSTOMER",
      label: "Customer Demo",
      email: "customer@ofoms.demo",
      icon: User,
      desc: "Order food, track live GPS, review",
      redirect: "/",
    },
    {
      role: "RESTAURANT_MANAGER",
      label: "Restaurant Manager",
      email: "restaurant@ofoms.demo",
      icon: Store,
      desc: "Kitchen queue, menu & pricing, reports",
      redirect: "/admin",
    },
    {
      role: "DELIVERY_PERSONNEL",
      label: "Delivery Partner",
      email: "delivery@ofoms.demo",
      icon: Bike,
      desc: "Accept trips, live navigation, status",
      redirect: "/delivery",
    },
    {
      role: "SYSTEM_ADMIN",
      label: "Platform Admin",
      email: "admin@ofoms.demo",
      icon: ShieldCheck,
      desc: "Approve merchants, platform health",
      redirect: "/system-admin",
    },
  ];

  const handleSelectDemo = (demo: any) => {
    setEmail(demo.email);
    setPassword("demo123");
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password. You can use the 1-click demo accounts below.");
        setIsLoading(false);
        return;
      }

      // Role-based redirect as specified in SRS requirement #20
      if (email.includes("restaurant") || email.includes("staff")) {
        router.push("/admin");
      } else if (email.includes("delivery")) {
        router.push("/delivery");
      } else if (email.includes("admin")) {
        router.push("/system-admin");
      } else {
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-1">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome to OFOMS
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your role-based dashboard and operations
          </p>
        </div>

        {/* 1-Click Demo Accounts Bar */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Seeded Demo Logins</span>
            </span>
            <span className="text-[10px] text-slate-400">Password: demo123</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {demoAccounts.map((d) => {
              const Icon = d.icon;
              const isSelected = email === d.email;

              return (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleSelectDemo(d)}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? "bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30"
                      : "bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-orange-300" />
                    <span className="font-bold text-xs">{d.label}</span>
                  </div>
                  <p className="text-[10px] text-white/80 line-clamp-1">{d.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@ofoms.demo"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 dark:text-slate-300 font-semibold">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-orange-600 hover:underline font-semibold text-[11px]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>{isLoading ? "Signing In..." : "Sign In with Selected Role"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
