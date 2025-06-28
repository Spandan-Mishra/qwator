import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Appbar from '../components/Appbar';
import "./globals.css";
import { Toaster } from "sonner";
import { SolanaProvider } from "@/providers/SolanaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voter App",
  description: "Voter interface for qwator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          <Appbar />
          {children}
          <Toaster />
        </SolanaProvider>
      </body>
    </html>
  );
}
