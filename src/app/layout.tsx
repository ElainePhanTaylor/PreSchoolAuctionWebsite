import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-provider";
import { AuctionCountdownBanner } from "@/components/AuctionCountdownBanner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "San Anselmo Coop Auction",
  description: "Silent auction fundraiser for San Anselmo Cooperative Nursery School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <AuthProvider>
          <AuctionCountdownBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
