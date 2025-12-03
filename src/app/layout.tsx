'use client'

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata can't be exported from a client component.
// We'll keep it here, but for dynamic metadata, another approach would be needed.


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="es" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen flex flex-col`}
      >
        {!isAuthPage && <Nav />}
        <main
          className={
            isAuthPage
              ? 'flex-grow w-full' // Removed padding for auth pages to allow full-screen layouts
              : 'max-w-7xl mx-auto px-4 pt-24 pb-6 flex-grow w-full'
          }
        >
          {children}
        </main>
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}
