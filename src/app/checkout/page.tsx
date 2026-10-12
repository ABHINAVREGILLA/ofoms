"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { AddressType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  Building,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, items, restaurant, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    recipient: user?.name || "Rahul Sharma",
    phone: user?.phone || "+91 98765 43210",
    street: "Flat 402, Sai Balaji Residency, Street No. 4",
    area: "Madhapur, Near Cyber Towers",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500081",
  });

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [upiId, setUpiId] = useState("rahul@okaxis");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Payment simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Retrieve coupon if stored in sessionStorage
  const [couponCode, setCouponCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("ofoms_applied_coupon");
    if (saved) setCouponCode(saved);

    // Fetch user addresses
    async function loadAddresses() {
      try {
        const res = await fetch("/api/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || []);
          if (data.addresses && data.addresses.length > 0) {
            const def = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(def.id);
          }
        }
      } catch (e) {
        console.error("Addresses load failed:", e);
      }
    }
    loadAddresses();
  }, []);

  const deliveryFee = restaurant?.deliveryFee || 35;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  let discount = 0;
  if (couponCode === "WELCOME50") {
    discount = Math.min(subtotal * 0.5, 100);
  } else if (couponCode === "BIRYANI20") {
    discount = Math.min(subtotal * 0.2, 150);
  } else if (couponCode === "OFOMS100") {
    discount = 100;
  }
  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discount);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAddress, isDefault: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [data.address, ...prev]);
        setSelectedAddressId(data.address.id);
        setIsAddingAddress(false);
      }
    } catch {
      setError("Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    let chosenAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!chosenAddress) {
      if (addresses.length > 0) {
        chosenAddress = addresses[0];
      } else {
        chosenAddress = {
          id: "temp",
          userId: user?.id || "",
          label: "Home",
          recipient: user?.name || "Rahul Sharma",
          phone: "+91 98765 43210",
          street: "Flat 402, Sai Balaji Residency",
          area: "Madhapur, Hyderabad",
          city: "Hyderabad",
          state: "Telangana",
          postalCode: "500081",
          lat: 17.4504,
          lng: 78.3808,
          isDefault: true,
        };
      }
    }

    setIsProcessing(true);
    setError(null);

    // Realistic Simulated Payment Sequence
    setProcessingStep("Connecting to Payment Gateway...");
    await new Promise((r) => setTimeout(r, 700));

    setProcessingStep(`Simulating ${paymentMethod} Authorization...`);
    await new Promise((r) => setTimeout(r, 900));

    setProcessingStep("Payment Verified! Confirming with Kitchen...");
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress: chosenAddress,
          paymentMethod,
          couponCode,
          specialInstructions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      sessionStorage.removeItem("ofoms_applied_coupon");
      router.push(`/orders/${data.orderId}/confirmation`);
    } catch {
      setError("Network error while creating order");
      setIsProcessing(false);
    }
  };

  if (!cart || items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items from a restaurant before checking out.</p>
        <button
          onClick={() => router.push("/restaurants")}
          className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
          Final Step
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Simulated 256-Bit SSL Encrypted Payment Flow</span>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Address & Payment Method */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Delivery Address */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Delivery Address (Hyderabad)
                </h3>
              </div>

              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {isAddingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipient}
                      onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Street / Flat / Building</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Area / Landmark</label>
                    <input
                      type="text"
                      required
                      value={newAddress.area}
                      onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Postal Code (PIN)</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
                  >
                    Save & Deliver Here
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-orange-50/50 border border-orange-200 text-xs text-orange-800">
                    No saved addresses. Please click "Add New Address" above.
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            {addr.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-orange-600 fill-orange-100 dark:fill-orange-950" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {addr.recipient} ({addr.phone})
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {addr.street}, {addr.area}, {addr.city} - {addr.postalCode}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Section 2: Cooking & Delivery Instructions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Special Instructions
            </h4>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please ring doorbell twice, keep spicy salan separate, don't include plastic cutlery..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Section 3: Payment Options (Simulated) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Payment Method (Simulated Prototype)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select payment gateway simulation. No actual money is debited.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* UPI */}
              <div
                onClick={() => setPaymentMethod("UPI")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "UPI"
                    ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Instant UPI (Google Pay, PhonePe, Paytm QR)
                      </span>
                      <p className="text-[11px] text-slate-500">Zero transaction fees • Instant confirmation</p>
                    </div>
                  </div>
                  {paymentMethod === "UPI" && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </div>

                {paymentMethod === "UPI" && (
                  <div className="mt-3 pt-3 border-t border-orange-200/60 dark:border-orange-900/40">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white w-full sm:w-64"
                    />
                  </div>
                )}
              </div>

              {/* Credit/Debit Card */}
              <div
                onClick={() => setPaymentMethod("CARD")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "CARD"
                    ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Credit / Debit Cards
                      </span>
                      <p className="text-[11px] text-slate-500">Visa, MasterCard, RuPay, Maestro</p>
                    </div>
                  </div>
                  {paymentMethod === "CARD" && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </div>

                {paymentMethod === "CARD" && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                        defaultValue="4242 •••• •••• 4242"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        defaultValue="12/28"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="891"
                        maxLength={3}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Wallets */}
              <div
                onClick={() => setPaymentMethod("WALLET")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "WALLET"
                    ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Digital Wallets (Amazon Pay, Mobikwik)
                      </span>
                      <p className="text-[11px] text-slate-500">One-click simulated checkout</p>
                    </div>
                  </div>
                  {paymentMethod === "WALLET" && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </div>
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-[11px] text-slate-500">Pay cash or UPI upon delivery</p>
                    </div>
                  </div>
                  {paymentMethod === "COD" && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Order Summary
            </h4>

            {restaurant && (
              <div className="text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                {restaurant.name}
              </div>
            )}

            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[160px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.menuItem?.name || "Dish"}
                    </span>
                    <span className="text-slate-400 ml-1.5">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-xl text-orange-600 dark:text-orange-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-4 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{processingStep}</span>
                </>
              ) : (
                <span>Pay {formatCurrency(grandTotal)} & Place Order</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
