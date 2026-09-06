import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rug Pull Lab",
  description: "Solana security research and trading laboratory for Localnet and Devnet experiments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
