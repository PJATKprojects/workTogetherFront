import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
  type Locale,
} from "@/i18n/locales";

const PUBLIC_FILE = /\.[^/]+$/;

function readStoredLocale(request: NextRequest): Locale | null {
  const raw = request.cookies.get(localeCookieName)?.value;
  return raw && isLocale(raw) ? raw : null;
}

function persistLocale(response: NextResponse, locale: Locale) {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: localeCookieMaxAgeSeconds,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1];

  if (segment && isLocale(segment)) {
    const response = NextResponse.next();
    persistLocale(response, segment);
    return response;
  }

  const locale = readStoredLocale(request) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};
