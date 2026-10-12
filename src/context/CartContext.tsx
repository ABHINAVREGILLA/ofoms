"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartType, CartItemType, RestaurantType } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CartType | null;
  items: CartItemType[];
  restaurant: RestaurantType | null;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  conflictData: {
    isOpen: boolean;
    currentRestaurantName: string;
    newRestaurantName: string;
    pendingItem?: {
      menuItemId: string;
      quantity: number;
      selectedCustomizations?: any;
    };
  } | null;
  addToCart: (
    menuItemId: string,
    quantity?: number,
    selectedCustomizations?: any,
    clearExisting?: boolean
  ) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resolveConflict: (replace: boolean) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conflictData, setConflictData] = useState<{
    isOpen: boolean;
    currentRestaurantName: string;
    newRestaurantName: string;
    pendingItem?: {
      menuItemId: string;
      quantity: number;
      selectedCustomizations?: any;
    };
  } | null>(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to load cart:", e);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const items = cart?.items || [];
  const restaurant = cart?.restaurant || null;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = async (
    menuItemId: string,
    quantity = 1,
    selectedCustomizations: any = null,
    clearExisting = false
  ): Promise<boolean> => {
    if (!user) {
      // Auto login as demo customer if guest adds to cart for effortless demonstration!
      try {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "customer@ofoms.demo", password: "demo123" }),
        });
        window.location.reload();
        return false;
      } catch {
        return false;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId,
          quantity,
          selectedCustomizations,
          clearExisting,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.conflict) {
        // Multi-restaurant conflict detected (SRS rule)
        setConflictData({
          isOpen: true,
          currentRestaurantName: data.currentRestaurantName,
          newRestaurantName: data.newRestaurantName,
          pendingItem: { menuItemId, quantity, selectedCustomizations },
        });
        return false;
      }

      if (res.ok && data.cart) {
        setCart(data.cart);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Add to cart failed:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Update quantity failed:", e);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${cartItemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Remove from cart failed:", e);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart", { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Clear cart failed:", e);
    }
  };

  const resolveConflict = async (replace: boolean) => {
    if (!conflictData || !conflictData.pendingItem) {
      setConflictData(null);
      return;
    }

    if (replace) {
      const { menuItemId, quantity, selectedCustomizations } = conflictData.pendingItem;
      await addToCart(menuItemId, quantity, selectedCustomizations, true);
    }
    setConflictData(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        restaurant,
        itemCount,
        subtotal,
        isLoading,
        conflictData,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resolveConflict,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
