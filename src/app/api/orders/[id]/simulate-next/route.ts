import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_FLOW = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= STATUS_FLOW.length) {
      // Loop or reset to PLACED for endless testing/demo
      nextIndex = 0;
    }

    const nextStatus = STATUS_FLOW[nextIndex];

    // Compute simulated rider coordinates along route between restaurant and customer
    let rLat = order.restaurant.lat;
    let rLng = order.restaurant.lng;
    let cLat = 17.4504; // default customer target
    let cLng = 78.3808;

    try {
      if (order.deliveryAddressJson) {
        const addr = JSON.parse(order.deliveryAddressJson);
        if (addr.lat && addr.lng) {
          cLat = addr.lat;
          cLng = addr.lng;
        }
      }
    } catch {}

    // Interpolation factor based on status
    let fraction = 0;
    if (nextStatus === "PLACED" || nextStatus === "ACCEPTED" || nextStatus === "PREPARING") {
      fraction = 0; // at restaurant
    } else if (nextStatus === "READY_FOR_PICKUP") {
      fraction = 0.1;
    } else if (nextStatus === "OUT_FOR_DELIVERY") {
      fraction = 0.65; // halfway
    } else if (nextStatus === "DELIVERED") {
      fraction = 1.0; // arrived at customer
    }

    const currentLat = rLat + (cLat - rLat) * fraction;
    const currentLng = rLng + (cLng - rLng) * fraction;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        restaurant: true,
        items: true,
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
        status: nextStatus,
        note: `Advanced status via prototype simulation to ${nextStatus}`,
      },
    });

    if (order.deliveryAssignment) {
      const assignmentData: any = {
        status: nextStatus === "DELIVERED" ? "DELIVERED" : (nextStatus === "OUT_FOR_DELIVERY" ? "OUT_FOR_DELIVERY" : "ACCEPTED"),
        currentLat,
        currentLng,
      };

      if (nextStatus === "OUT_FOR_DELIVERY" && !order.deliveryAssignment.pickupTime) {
        assignmentData.pickupTime = new Date();
      }
      if (nextStatus === "DELIVERED") {
        assignmentData.deliveredTime = new Date();
      }

      await prisma.deliveryAssignment.update({
        where: { orderId: id },
        data: assignmentData,
      });
    }

    // Friendly messages for notifications
    const statusMessages: Record<string, { title: string; message: string }> = {
      PLACED: {
        title: "Order Placed 🍲",
        message: `Order #${order.orderNumber} placed at ${order.restaurant.name}.`,
      },
      ACCEPTED: {
        title: "Order Accepted! 👨‍🍳",
        message: `Your order #${order.orderNumber} has been accepted by ${order.restaurant.name}.`,
      },
      PREPARING: {
        title: "Food Being Prepared 🍳",
        message: `The kitchen at ${order.restaurant.name} is now preparing your fresh order.`,
      },
      READY_FOR_PICKUP: {
        title: "Order Packed & Ready 📦",
        message: `Order #${order.orderNumber} is packed and ready for delivery partner pickup.`,
      },
      OUT_FOR_DELIVERY: {
        title: "Rider Out For Delivery! 🛵",
        message: `Your rider is on the way! Estimated arrival in 15 minutes.`,
      },
      DELIVERED: {
        title: "Order Delivered! 😋",
        message: `Order #${order.orderNumber} has arrived! Enjoy your delicious meal.`,
      },
    };

    if (statusMessages[nextStatus]) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: statusMessages[nextStatus].title,
          message: statusMessages[nextStatus].message,
          orderId: order.id,
          type: "ORDER",
        },
      });
    }

    return NextResponse.json({
      success: true,
      previousStatus: order.status,
      currentStatus: nextStatus,
      order: updatedOrder,
      coords: { currentLat, currentLng },
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json({ error: "Failed to simulate next status" }, { status: 500 });
  }
}
