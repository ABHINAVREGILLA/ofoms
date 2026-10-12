import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, recipient, phone, street, area, city, state, postalCode, isDefault } = await req.json();

    if (!recipient || !street || !area) {
      return NextResponse.json({ error: "Recipient name, street, and area are required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: label || "Home",
        recipient: recipient.trim(),
        phone: phone?.trim() || user.phone || "+91 98765 43210",
        street: street.trim(),
        area: area.trim(),
        city: city?.trim() || "Hyderabad",
        state: state?.trim() || "Telangana",
        postalCode: postalCode?.trim() || "500081",
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}
