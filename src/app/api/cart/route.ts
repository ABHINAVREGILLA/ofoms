import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ cart: null, items: [] });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        restaurant: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          restaurant: true,
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to get cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to add items to your cart" }, { status: 401 });
    }

    const { menuItemId, quantity = 1, selectedCustomizations = null, clearExisting = false } = await req.json();

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        restaurant: true,
        items: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          restaurantId: menuItem.restaurantId,
        },
        include: {
          restaurant: true,
          items: true,
        },
      });
    }

    // Check single-restaurant constraint (SRS rule)
    if (cart.restaurantId && cart.restaurantId !== menuItem.restaurantId && cart.items.length > 0) {
      if (!clearExisting) {
        return NextResponse.json({
          conflict: true,
          currentRestaurantName: cart.restaurant?.name || "another restaurant",
          newRestaurantName: menuItem.restaurant.name,
          message: `Your cart contains items from ${cart.restaurant?.name}. Clear cart and add items from ${menuItem.restaurant.name}?`,
        }, { status: 409 });
      } else {
        // Clear old cart items and update restaurantId
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart.update({
          where: { id: cart.id },
          data: { restaurantId: menuItem.restaurantId },
        });
      }
    } else if (!cart.restaurantId) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: menuItem.restaurantId },
      });
    }

    // Calculate final unit price including any add-ons
    let unitPrice = menuItem.price;
    if (selectedCustomizations) {
      try {
        const custObj = typeof selectedCustomizations === "string" ? JSON.parse(selectedCustomizations) : selectedCustomizations;
        if (custObj && typeof custObj === "object") {
          // Add extra prices if defined
          for (const key of Object.keys(custObj)) {
            const val = custObj[key];
            if (val && typeof val === "object" && typeof val.extraPrice === "number") {
              unitPrice += val.extraPrice;
            }
          }
        }
      } catch (e) {
        console.error("Customization parse error:", e);
      }
    }

    // Check if the exact item with same customizations exists
    const custString = typeof selectedCustomizations === "string" ? selectedCustomizations : JSON.stringify(selectedCustomizations || {});
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        menuItemId: menuItem.id,
        selectedCustomizations: custString,
      },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: menuItem.id,
          quantity,
          selectedCustomizations: custString,
          price: unitPrice,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        restaurant: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, quantity } = await req.json();

    if (!cartItemId) {
      return NextResponse.json({ error: "Cart item ID is required" }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        restaurant: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    // If cart is now empty, reset restaurantId
    if (cart && cart.items.length === 0) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: null },
      });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error("Cart PUT error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("itemId");

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return NextResponse.json({ success: true });
    }

    if (cartItemId) {
      await prisma.cartItem.deleteMany({
        where: {
          id: cartItemId,
          cartId: cart.id,
        },
      });
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: null },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        restaurant: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete item from cart" }, { status: 500 });
  }
}
