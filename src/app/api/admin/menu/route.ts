import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let restaurantId = user.managedRestaurantId;
    if (!restaurantId) {
      const first = await prisma.restaurant.findFirst();
      restaurantId = first?.id || null;
    }

    if (!restaurantId) {
      return NextResponse.json({ items: [], categories: [] });
    }

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: "asc" },
    });

    const items = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ items, categories, restaurantId });
  } catch (error) {
    console.error("Admin menu GET error:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let restaurantId = user.managedRestaurantId;
    if (!restaurantId) {
      const first = await prisma.restaurant.findFirst();
      restaurantId = first?.id || "";
    }

    const {
      name,
      description,
      price,
      originalPrice,
      isVeg = true,
      isAvailable = true,
      isPopular = false,
      image,
      categoryId,
      customizationsJson,
    } = await req.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        isVeg: Boolean(isVeg),
        isAvailable: Boolean(isAvailable),
        isPopular: Boolean(isPopular),
        image: image?.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        restaurantId,
        categoryId,
        customizationsJson: customizationsJson || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Admin menu POST error:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
