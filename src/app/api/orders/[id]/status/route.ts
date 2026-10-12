import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, currentLat, currentLng } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        deliveryAssignment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role check: Only restaurant, delivery, or admin can update status
    const isRestaurantRole = user.role === "RESTAURANT_MANAGER" || user.role === "RESTAURANT_STAFF";
    const isDeliveryRole = user.role === "DELIVERY_PERSONNEL";
    const isAdmin = user.role === "SYSTEM_ADMIN";

    if (!isRestaurantRole && !isDeliveryRole && !isAdmin) {
      return NextResponse.json({ error: "Permission denied to update order status" }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        restaurant: true,
        deliveryAssignment: {
          include: {
            deliveryPersonnel: true,
          },
        },
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: status,
        note: `Status updated by ${user.name} (${user.role})`,
      },
    });

    // Update delivery assignment coordinates & status if applicable
    if (order.deliveryAssignment) {
      const assignmentUpdateData: any = {};
      if (status === "OUT_FOR_DELIVERY") {
        assignmentUpdateData.status = "OUT_FOR_DELIVERY";
        assignmentUpdateData.pickupTime = new Date();
      } else if (status === "DELIVERED") {
        assignmentUpdateData.status = "DELIVERED";
        assignmentUpdateData.deliveredTime = new Date();
      } else if (status === "READY_FOR_PICKUP") {
        assignmentUpdateData.status = "ACCEPTED";
      }

      if (currentLat && currentLng) {
        assignmentUpdateData.currentLat = currentLat;
        assignmentUpdateData.currentLng = currentLng;
      }

      if (Object.keys(assignmentUpdateData).length > 0) {
        await prisma.deliveryAssignment.update({
          where: { orderId: id },
          data: assignmentUpdateData,
        });
      }
    }

    // Friendly messages for notifications
    const statusMessages: Record<string, { title: string; message: string }> = {
      ACCEPTED: {
        title: "Order Accepted! 👨‍🍳",
        message: `Your order #${order.orderNumber} has been accepted by ${order.restaurant.name}.`,
      },
      PREPARING: {
        title: "Food Being Prepared 🍳",
        message: `The kitchen at ${order.restaurant.name} is now preparing your delicious meal.`,
      },
      READY_FOR_PICKUP: {
        title: "Order Packed & Ready 📦",
        message: `Your order #${order.orderNumber} is packed and ready for rider pickup.`,
      },
      OUT_FOR_DELIVERY: {
        title: "Rider Out For Delivery! 🛵",
        message: `Your food is on the way! The delivery partner is heading to your location.`,
      },
      DELIVERED: {
        title: "Order Delivered! 😋",
        message: `Your order #${order.orderNumber} has been delivered. Enjoy your meal! Please rate your experience.`,
      },
      CANCELLED: {
        title: "Order Cancelled ❌",
        message: `Order #${order.orderNumber} was cancelled. Refund has been initiated.`,
      },
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: statusMessages[status].title,
          message: statusMessages[status].message,
          orderId: order.id,
          type: "ORDER",
        },
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
