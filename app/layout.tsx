import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tora-x125",
  description: "Secondary market for verified impact investments"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
