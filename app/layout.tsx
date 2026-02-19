import type { Metadata } from "next";
import "./globals.css";
import { Cursor } from "@/components/ui/inverted-cursor";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Design portfolio with interactive 3D project folders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased cursor-none">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
