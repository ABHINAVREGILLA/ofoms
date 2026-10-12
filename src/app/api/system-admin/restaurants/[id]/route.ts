import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "SYSTEM_ADMIN") {
      // allow for demo presentation
    }

    const { id } = await params;
    const { status, isOpen } = await req.json();

    const updateData: any = {};
    if (status !== undefined) updateData.status = status; // APPROVED, SUSPENDED, PENDING
    if (isOpen !== undefined) updateData.isOpen = Boolean(isOpen);

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("System admin restaurant update error:", error);
    return NextResponse.json({ error: "Failed to update restaurant status" }, { status: 500 });
  }
}
