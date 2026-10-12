import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (user.role === "CUSTOMER") {
      whereClause.userId = user.id;
    } else if (user.role === "RESTAURANT_MANAGER" || user.role === "RESTAURANT_STAFF") {
      if (user.managedRestaurantId) {
        whereClause.restaurantId = user.managedRestaurantId;
      }
    } else if (user.role === "DELIVERY_PERSONNEL") {
      whereClause.deliveryAssignment = {
        deliveryPersonnelId: user.id,
      };
    }
    // SYSTEM_ADMIN sees all

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            coverImage: true,
            cuisineType: true,
            address: true,
            phone: true,
          },
        },
        items: true,
        deliveryAssignment: {
          include: {
            deliveryPersonnel: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        payment: true,
        review: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
    }

    const {
      deliveryAddress,
      paymentMethod = "UPI",
      couponCode = null,
      specialInstructions = null,
    } = await req.json();

    if (!deliveryAddress) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        restaurant: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart || cart.items.length === 0 || !cart.restaurantId || !cart.restaurant) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (subtotal < cart.restaurant.minOrderValue) {
      return NextResponse.json({
        error: `Minimum order value for ${cart.restaurant.name} is ₹${cart.restaurant.minOrderValue}`,
      }, { status: 400 });
    }

    const deliveryFee = cart.restaurant.deliveryFee;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive && new Date(coupon.validUntil) >= new Date() && subtotal >= coupon.minOrderValue) {
        discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
      }
    }

    const total = Math.max(0, subtotal + deliveryFee + tax - discount);
    const orderNumber = generateOrderNumber();

    // Find an active delivery partner to assign
    const deliveryPartner = await prisma.user.findFirst({
      where: { role: "DELIVERY_PERSONNEL" },
    });

    // Create Order with Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          restaurantId: cart.restaurantId!,
          status: "PLACED",
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
          couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
          specialInstructions: specialInstructions?.trim() || null,
          deliveryAddressJson: typeof deliveryAddress === "string" ? deliveryAddress : JSON.stringify(deliveryAddress),
          paymentMethod,
          paymentStatus: "COMPLETED",
          estimatedDeliveryMinutes: cart.restaurant!.deliveryTimeMin + 10,
          items: {
            create: cart.items.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.menuItem.name,
              price: item.price,
              quantity: item.quantity,
              customizationsJson: item.selectedCustomizations,
            })),
          },
        },
      });

      // Create Payment
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          transactionId: `TXN_${paymentMethod}_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          method: paymentMethod,
          status: "COMPLETED",
          amount: total,
          gatewayRef: `simulated_${paymentMethod.toLowerCase()}_gateway`,
        },
      });

      // Create Delivery Assignment
      await tx.deliveryAssignment.create({
        data: {
          orderId: newOrder.id,
          deliveryPersonnelId: deliveryPartner?.id || null,
          status: "ASSIGNED",
          currentLat: cart.restaurant!.lat,
          currentLng: cart.restaurant!.lng,
          notes: "Auto-assigned by OFOMS dispatch system",
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Order Placed! 🍲",
          message: `Your order #${newOrder.orderNumber} at ${cart.restaurant!.name} was received successfully.`,
          orderId: newOrder.id,
          type: "ORDER",
        },
      });

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await tx.cart.update({
        where: { id: cart.id },
        data: { restaurantId: null },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
