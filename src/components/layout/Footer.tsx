"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Shield, Code, Heart, Sparkles, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                OF<span className="text-orange-500">OMS</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Online Food Ordering Management System. A production-grade full-stack platform featuring multi-role access control, live GPS order tracking simulation, menu management, and analytics.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Covering Hyderabad (Madhapur, Hitech City, Gachibowli, Banjara Hills)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Customer Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/restaurants" className="hover:text-orange-400 transition-colors">Browse Restaurants</Link></li>
              <li><Link href="/restaurants?cuisine=Biryani" className="hover:text-orange-400 transition-colors">Hyderabadi Biryani</Link></li>
              <li><Link href="/restaurants?veg=true" className="hover:text-orange-400 transition-colors">Pure Veg Kitchens</Link></li>
              <li><Link href="/cart" className="hover:text-orange-400 transition-colors">My Cart</Link></li>
              <li><Link href="/orders" className="hover:text-orange-400 transition-colors">Order History & Reorder</Link></li>
            </ul>
          </div>

          {/* Management Portals */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Enterprise Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/admin" className="hover:text-orange-400 transition-colors">Restaurant Dashboard</Link></li>
              <li><Link href="/admin/orders" className="hover:text-orange-400 transition-colors">Kitchen Order Queue</Link></li>
              <li><Link href="/admin/menu" className="hover:text-orange-400 transition-colors">Menu & Stock Manager</Link></li>
              <li><Link href="/delivery" className="hover:text-emerald-400 transition-colors">Delivery Partner App</Link></li>
              <li><Link href="/system-admin" className="hover:text-blue-400 transition-colors">System Admin Console</Link></li>
            </ul>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Demo Credentials</h4>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 font-mono">
              <div className="text-slate-300">Password: <span className="text-orange-400">demo123</span></div>
              <div className="truncate"><span className="text-slate-500">Cust:</span> customer@ofoms.demo</div>
              <div className="truncate"><span className="text-slate-500">Rest:</span> restaurant@ofoms.demo</div>
              <div className="truncate"><span className="text-slate-500">Rider:</span> delivery@ofoms.demo</div>
              <div className="truncate"><span className="text-slate-500">Admin:</span> admin@ofoms.demo</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OFOMS — Online Food Ordering Management System. Academic Prototype.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-orange-500" /> Next.js 16 + React 19 + Prisma + SQLite
            </span>
            <span className="text-slate-700">•</span>
            <span>SRS Specification Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
