import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { RoleBanner } from "@/components/layout/RoleBanner";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConflictModal } from "@/components/ui/ConflictModal";

import { DemoControlPanel } from "@/components/layout/DemoControlPanel";

export const metadata: Metadata = {
  title: "OFOMS — Online Food Ordering Management System [DEMO / COLLEGE PROTOTYPE]",
  description:
    "DEMO PROTOTYPE — OFOMS is a fictional food ordering platform built as a college Software Engineering project. All restaurants, menus, orders, customers, and data are completely simulated. No real businesses or payments are involved.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <AuthProvider>
          <CartProvider>
            <DemoBanner />
            <RoleBanner />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ConflictModal />
            <DemoControlPanel />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
