"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AddressType } from "@/lib/types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  Shield,
  LogOut,
  Save,
  Check,
  Plus,
  Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "ADDRESSES" | "PAYMENTS" | "SETTINGS">("PROFILE");
  const [name, setName] = useState(user?.name || "Rahul Sharma");
  const [email, setEmail] = useState(user?.email || "customer@ofoms.demo");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [isSaved, setIsSaved] = useState(false);

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Work",
    recipient: user?.name || "Rahul Sharma",
    phone: user?.phone || "+91 98765 43210",
    street: "Floor 4, Cyber Towers",
    area: "Hitech City",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500081",
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "+91 98765 43210");
    }

    async function loadAddresses() {
      try {
        const res = await fetch("/api/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || []);
        }
      } catch {}
    }
    loadAddresses();
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [data.address, ...prev]);
        setIsAddingAddr(false);
      }
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
          Account Management
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Customer Profile & Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {[
            { id: "PROFILE", label: "Personal Information", icon: User },
            { id: "ADDRESSES", label: "Saved Addresses", icon: MapPin },
            { id: "PAYMENTS", label: "Payment Preferences", icon: CreditCard },
            { id: "SETTINGS", label: "Security & Settings", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 transition-colors text-left mt-6"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Main Settings Card */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {activeTab === "PROFILE" && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Personal Information
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 font-extrabold text-xl flex items-center justify-center border-2 border-orange-500">
                  {name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-600">
                    {user?.role || "CUSTOMER"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-400 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Email cannot be changed directly in demo mode.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>

                {isSaved && (
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 animate-in fade-in">
                    <Check className="w-4 h-4" /> Saved!
                  </span>
                )}
              </div>
            </form>
          )}

          {activeTab === "ADDRESSES" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Delivery Addresses ({addresses.length})
                </h3>
                {!isAddingAddr && (
                  <button
                    onClick={() => setIsAddingAddr(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {isAddingAddr && (
                <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-500">Address Label</label>
                      <input
                        type="text"
                        value={newAddr.label}
                        onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-500">Phone</label>
                      <input
                        type="text"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-semibold text-slate-500">Street & Building</label>
                      <input
                        type="text"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-500">Area</label>
                      <input
                        type="text"
                        value={newAddr.area}
                        onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-500">PIN Code</label>
                      <input
                        type="text"
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs">
                      Save Address
                    </button>
                    <button type="button" onClick={() => setIsAddingAddr(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-orange-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {addr.recipient} ({addr.phone})
                    </p>
                    <p className="text-xs text-slate-500">
                      {addr.street}, {addr.area}, {addr.city} - {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "PAYMENTS" && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Payment Preferences
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage your saved UPI handles and cards for 1-click checkout.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      rahul@okaxis
                    </h5>
                    <span className="text-[10px] text-slate-400">Primary Google Pay UPI</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  Verified
                </span>
              </div>
            </div>
          )}

          {activeTab === "SETTINGS" && (
            <div className="space-y-6 max-w-xl">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Security & Platform Settings
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Role & Access Level</span>
                <p className="text-slate-500">
                  Current role: <strong className="text-orange-600">{user?.role || "CUSTOMER"}</strong>. You have permissions to browse restaurants, add cart items, simulate orders, and track deliveries.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
