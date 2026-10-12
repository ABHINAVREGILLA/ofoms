import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Active deliveries assigned to this rider or available deliveries
    const assignments = await prisma.deliveryAssignment.findMany({
      where: {
        OR: [
          { deliveryPersonnelId: user.id },
          { deliveryPersonnelId: null, status: "ASSIGNED" },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            restaurant: true,
            items: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Delivery assignments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
  }
}
