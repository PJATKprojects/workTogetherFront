import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";

const loginDisplay = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-login-display",
  weight: ["500", "600"],
});

export default function LoginLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={`${loginDisplay.variable} min-h-0`}>{children}</div>;
}
