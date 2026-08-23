import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Handshake Alerts",
    template: "%s · Handshake Alerts",
  },
  description:
    "Get SMS alerts when Handshake AI projects you follow have claimable tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-hs-bg font-sans text-hs-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
