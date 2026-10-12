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
    const { status, action } = await req.json();

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    let newStatus = status || assignment.status;
    let orderStatus = assignment.order.status;
    const updateData: any = {};

    if (action === "ACCEPT") {
      updateData.deliveryPersonnelId = user.id;
      updateData.status = "ACCEPTED";
      newStatus = "ACCEPTED";
    } else if (action === "PICK_UP" || status === "PICKED_UP") {
      updateData.status = "PICKED_UP";
      updateData.pickupTime = new Date();
      orderStatus = "READY_FOR_PICKUP";
      newStatus = "PICKED_UP";
    } else if (action === "OUT_FOR_DELIVERY" || status === "OUT_FOR_DELIVERY") {
      updateData.status = "OUT_FOR_DELIVERY";
      orderStatus = "OUT_FOR_DELIVERY";
      newStatus = "OUT_FOR_DELIVERY";
    } else if (action === "DELIVER" || status === "DELIVERED") {
      updateData.status = "DELIVERED";
      updateData.deliveredTime = new Date();
      orderStatus = "DELIVERED";
      newStatus = "DELIVERED";
    }

    const updatedAssignment = await prisma.deliveryAssignment.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    // Also update parent Order status
    if (orderStatus !== assignment.order.status) {
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: orderStatus },
      });
    }

    return NextResponse.json({ success: true, assignment: updatedAssignment });
  } catch (error) {
    console.error("Update delivery assignment error:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}
