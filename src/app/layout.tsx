import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doorin5",
  description: "Tunbridge Wells local delivery MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
