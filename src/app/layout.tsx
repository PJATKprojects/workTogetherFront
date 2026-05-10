import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppThemeProvider } from "@/components/app-theme-provider";
import { defaultLocale } from "@/i18n/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Narrow fallback when metadata is not supplied by a child segment. */
export const metadata: Metadata = {
  title: "WorkTogether",
  description: "Teams for your projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
