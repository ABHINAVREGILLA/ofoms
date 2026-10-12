import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a review" }, { status: 401 });
    }

    const { orderId, restaurantId, rating, comment } = await req.json();

    if (!restaurantId || !rating || !comment) {
      return NextResponse.json({ error: "Restaurant, rating, and review comments are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars" }, { status: 400 });
    }

    // Check if review already exists for this order
    if (orderId) {
      const existing = await prisma.review.findFirst({
        where: { orderId },
      });
      if (existing) {
        return NextResponse.json({ error: "You have already reviewed this order" }, { status: 400 });
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        restaurantId,
        orderId: orderId || null,
        rating: Math.round(rating),
        comment: comment.trim(),
      },
    });

    // Recompute restaurant average rating
    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
      : 5.0;

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: avgRating,
        totalReviews,
      },
    });

    return NextResponse.json({ success: true, review, newRating: avgRating });
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
