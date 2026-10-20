import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horkos — Promises, on chain",
  description: "Verifiable creator fee pledges on Elysium. Follow the fees, inspect the oath, and know when a promise breaks.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
