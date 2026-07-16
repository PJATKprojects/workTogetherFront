import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { AppQueryProvider } from "@/components/app-query-provider";
import { AppThemeProvider } from "@/components/app-theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { defaultLocale } from "@/i18n/config";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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

const apiOrigin = process.env.NEXT_PUBLIC_API_URL;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      suppressHydrationWarning
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Warm up the API connection (DNS+TCP+TLS) before the first fetch. */}
        {apiOrigin ? (
          <link rel="preconnect" href={apiOrigin} crossOrigin="use-credentials" />
        ) : null}
      </head>
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <AppThemeProvider>
          <AppQueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </AppQueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
