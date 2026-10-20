import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horkos — Promises, on chain",
  description: "Trading-fee pledges for token launchers and their holders. Inspect locked fees, payouts and commitments on Elysium Testnet. Ascend integration is pending.",
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
