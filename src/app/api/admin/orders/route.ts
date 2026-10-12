import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine restaurant ID
    let restaurantId = user.managedRestaurantId;
    if (!restaurantId && user.role === "SYSTEM_ADMIN") {
      const first = await prisma.restaurant.findFirst();
      restaurantId = first?.id || null;
    }

    if (!restaurantId) {
      // Default to first restaurant for smooth demo
      const firstRest = await prisma.restaurant.findFirst();
      restaurantId = firstRest?.id || "";
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let whereClause: any = { restaurantId };
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
        deliveryAssignment: {
          include: {
            deliveryPersonnel: true,
          },
        },
        payment: true,
      },
    });

    // Calculate queue metrics
    const allRestaurantOrders = await prisma.order.findMany({
      where: { restaurantId },
      select: { status: true, total: true },
    });

    const counts = {
      all: allRestaurantOrders.length,
      placed: allRestaurantOrders.filter((o) => o.status === "PLACED").length,
      accepted: allRestaurantOrders.filter((o) => o.status === "ACCEPTED").length,
      preparing: allRestaurantOrders.filter((o) => o.status === "PREPARING").length,
      ready: allRestaurantOrders.filter((o) => o.status === "READY_FOR_PICKUP").length,
      outForDelivery: allRestaurantOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
      delivered: allRestaurantOrders.filter((o) => o.status === "DELIVERED").length,
    };

    return NextResponse.json({ orders, counts, restaurantId });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed to fetch admin orders" }, { status: 500 });
  }
}
