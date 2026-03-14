import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({ subsets: ["latin"], weight: ['400', '700', '900'] });

export const metadata: Metadata = {
  title: "CREATOR HUB | Monetize Your Passion",
  description: "The ultimate platform for creators to connect with their fans and monetize their content.",
};

import SessionManager from "@/components/SessionManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <WalletProvider>
          <SessionManager />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
