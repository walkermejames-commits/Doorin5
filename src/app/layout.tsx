import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doorin5 | Tunbridge Wells Delivery",
  description: "Single-driver local delivery MVP for Tunbridge Wells",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f6f7f2] text-gray-950 antialiased">{children}</body>
    </html>
  );
}
