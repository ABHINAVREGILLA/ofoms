import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toUpperCase().trim();
    const orderValue = searchParams.get("amount") ? parseFloat(searchParams.get("amount")!) : 0;

    if (code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code },
      });

      if (!coupon || !coupon.isActive || new Date(coupon.validUntil) < new Date()) {
        return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" }, { status: 400 });
      }

      if (orderValue < coupon.minOrderValue) {
        return NextResponse.json({
          valid: false,
          error: `Minimum order value for coupon ${coupon.code} is ₹${coupon.minOrderValue}`,
        }, { status: 400 });
      }

      const discount = Math.min((orderValue * coupon.discountPercent) / 100, coupon.maxDiscount);
      return NextResponse.json({
        valid: true,
        coupon,
        discount,
        message: `Coupon ${coupon.code} applied! Saved ₹${discount}`,
      });
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: new Date() },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Coupons API error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
