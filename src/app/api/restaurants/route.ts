import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const cuisine = searchParams.get("cuisine")?.trim();
    const minRating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : 0;
    const isVegOnly = searchParams.get("veg") === "true";
    const sortBy = searchParams.get("sort") || "rating_desc";

    const whereClause: any = {
      status: "APPROVED",
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { cuisineType: { contains: search } },
        { description: { contains: search } },
        {
          menuItems: {
            some: {
              name: { contains: search },
            },
          },
        },
      ];
    }

    if (cuisine && cuisine.toLowerCase() !== "all") {
      whereClause.cuisineType = {
        contains: cuisine,
      };
    }

    if (minRating > 0) {
      whereClause.rating = {
        gte: minRating,
      };
    }

    if (isVegOnly) {
      whereClause.isVegOnly = true;
    }

    let orderBy: any = { rating: "desc" };
    if (sortBy === "delivery_asc") {
      orderBy = { deliveryTimeMin: "asc" };
    } else if (sortBy === "reviews_desc") {
      orderBy = { totalReviews: "desc" };
    } else if (sortBy === "name_asc") {
      orderBy = { name: "asc" };
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy,
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error("Fetch restaurants error:", error);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}
