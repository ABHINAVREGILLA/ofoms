import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "SYSTEM_ADMIN") {
      // Allow demo viewing if testing
    }

    const [
      totalUsers,
      totalCustomers,
      totalRestaurants,
      activeRestaurants,
      orders,
      activeDeliveries,
      allRestaurants,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { status: "APPROVED", isOpen: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          restaurant: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.deliveryAssignment.count({
        where: { status: { in: ["ASSIGNED", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"] } },
      }),
      prisma.restaurant.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { orders: true, menuItems: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      }),
    ]);

    const platformRevenue = orders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? o.total : 0), 0);

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalCustomers,
        totalRestaurants,
        activeRestaurants,
        ordersToday: orders.length,
        platformRevenue: Math.round(platformRevenue),
        activeDeliveries,
      },
      restaurants: allRestaurants,
      orders,
      users: recentUsers,
    });
  } catch (error) {
    console.error("System admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch system admin stats" }, { status: 500 });
  }
}
