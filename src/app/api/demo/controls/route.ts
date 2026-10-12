import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "create-order") {
      // Find customer
      let customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (!customer) {
        return NextResponse.json({ error: "No customer account found" }, { status: 400 });
      }

      // Find first restaurant with items
      const restaurant = await prisma.restaurant.findFirst({
        where: { status: "APPROVED" },
        include: { menuItems: { take: 2 } },
      });

      if (!restaurant || restaurant.menuItems.length === 0) {
        return NextResponse.json({ error: "No active restaurant items" }, { status: 400 });
      }

      const item1 = restaurant.menuItems[0];
      const item2 = restaurant.menuItems[1] || item1;
      const subtotal = item1.price + item2.price;
      const deliveryFee = restaurant.deliveryFee || 35;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + deliveryFee + tax;

      const orderNumber = `OF-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: customer.id,
          restaurantId: restaurant.id,
          status: "PLACED",
          paymentMethod: "UPI",
          paymentStatus: "COMPLETED",
          subtotal,
          deliveryFee,
          tax,
          discount: 0,
          total,
          deliveryAddressJson: JSON.stringify({
            recipient: customer.name,
            phone: customer.phone || "+91 90000 10001",
            street: "42 Lakeview Residency",
            area: "Madhapur",
            city: "Hyderabad",
            state: "Telangana",
            postalCode: "500081",
            lat: 17.4485,
            lng: 78.3908,
          }),
          specialInstructions: "[DEMO CONTROL] Automated demo presentation order",
          estimatedDeliveryMinutes: 30,
          items: {
            create: [
              { menuItemId: item1.id, name: `${item1.name} [Demo]`, quantity: 1, price: item1.price },
              { menuItemId: item2.id, name: `${item2.name} [Demo]`, quantity: 1, price: item2.price },
            ],
          },
          statusHistory: {
            create: [{ status: "PLACED", note: "Demo Order created via presenter control panel" }],
          },
        },
        include: { restaurant: true },
      });

      // Create Payment
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          method: "UPI",
          status: "COMPLETED",
          transactionId: `DEMO-TXN-${Date.now()}`,
        },
      });

      // Find delivery rider and assign
      const rider = await prisma.user.findFirst({ where: { role: "DELIVERY_PERSONNEL" } });
      await prisma.deliveryAssignment.create({
        data: {
          orderId: order.id,
          deliveryPersonnelId: rider?.id || null,
          status: "ASSIGNED",
          currentLat: restaurant.lat,
          currentLng: restaurant.lng,
        },
      });

      // Create Notification
      await prisma.notification.create({
        data: {
          userId: customer.id,
          title: "🎉 New Demo Order Created!",
          message: `Order #${order.orderNumber} placed at ${restaurant.name}. Track live progress now!`,
          orderId: order.id,
          type: "ORDER",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Created order #${order.orderNumber}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    if (action === "advance-latest") {
      const order = await prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!order) {
        return NextResponse.json({ error: "No orders found to advance" }, { status: 400 });
      }

      // Call internal simulate-next logic
      const res = await fetch(`${req.nextUrl.origin}/api/orders/${order.id}/simulate-next`, {
        method: "POST",
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "reset-seed") {
      try {
        await execAsync("npx prisma db seed");
        return NextResponse.json({ success: true, message: "Demo data reset successfully to initial state" });
      } catch (e: any) {
        return NextResponse.json({ error: "Failed to reset seed data: " + e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Demo control error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute demo control" }, { status: 500 });
  }
}
